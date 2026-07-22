package com.cdms.service;

import com.cdms.entity.Donation;
import com.cdms.entity.Member;
import com.cdms.entity.RecurringDonation;
import com.cdms.entity.Tithe;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.RecurringDonationRepository;
import com.cdms.repository.TitheRepository;
import com.cdms.repository.UserRepository;
import com.cdms.security.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class RecurringDonationService {

    private final RecurringDonationRepository recurringDonationRepository;
    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final AuditLogService auditLogService;

    public RecurringDonationService(RecurringDonationRepository recurringDonationRepository,
                                     DonationRepository donationRepository,
                                     TitheRepository titheRepository,
                                     UserRepository userRepository,
                                     MemberRepository memberRepository,
                                     AuditLogService auditLogService) {
        this.recurringDonationRepository = recurringDonationRepository;
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public RecurringDonation createFromRequest(Map<String, Object> body) {
        RecurringDonation recurringDonation = new RecurringDonation();
        Long churchId = TenantContext.requireChurchId();
        recurringDonation.setChurchId(churchId);

        if (body.get("memberId") == null) {
            throw new BadRequestException("memberId is required");
        }
        Long memberId = Long.valueOf(body.get("memberId").toString());
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));
        recurringDonation.setMember(member);

        if (body.get("amount") == null) {
            throw new BadRequestException("amount is required");
        }
        recurringDonation.setAmount(new BigDecimal(body.get("amount").toString()));

        if (body.get("frequency") == null || body.get("frequency").toString().isBlank()) {
            throw new BadRequestException("frequency is required");
        }
        recurringDonation.setFrequency(body.get("frequency").toString());

        if (body.get("category") != null) {
            recurringDonation.setCategory(body.get("category").toString());
        }
        if (body.get("paymentMethod") != null) {
            recurringDonation.setPaymentMethod(body.get("paymentMethod").toString());
        }
        if (body.get("description") != null) {
            recurringDonation.setDescription(body.get("description").toString());
        }

        LocalDate nextDue = body.get("nextDueDate") != null
                ? LocalDate.parse(body.get("nextDueDate").toString())
                : LocalDate.now().plusDays(1);
        recurringDonation.setNextDueDate(nextDue);
        recurringDonation.setActive(true);

        return create(recurringDonation);
    }

    @Transactional
    public RecurringDonation create(RecurringDonation recurringDonation) {
        if (recurringDonation.getChurchId() == null) {
            recurringDonation.setChurchId(TenantContext.requireChurchId());
        }
        if (recurringDonation.getNextDueDate() == null) {
            recurringDonation.setNextDueDate(LocalDate.now().plusDays(1));
        }
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null) {
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                recurringDonation.setCreatedBy(user.getEmail());
            }
        }
        RecurringDonation saved = recurringDonationRepository.save(recurringDonation);
        auditLogService.log(currentUserId, "CREATE", "RECURRING_DONATION", saved.getId(),
                null, String.format("{\"amount\":%s,\"frequency\":\"%s\"}", saved.getAmount(), saved.getFrequency()));
        return saved;
    }

    public List<RecurringDonation> getActiveRecurring(Long churchId) {
        return recurringDonationRepository.findByChurchIdAndActive(churchId, true);
    }

    @Transactional
    public RecurringDonation cancel(Long id) {
        RecurringDonation recurring = recurringDonationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringDonation", id));
        recurring.setActive(false);
        RecurringDonation saved = recurringDonationRepository.save(recurring);
        auditLogService.log(getCurrentUserId(), "UPDATE", "RECURRING_DONATION", saved.getId(),
                "{\"active\":true}", "{\"active\":false}");
        return saved;
    }

    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void processDueRecurring() {
        LocalDate today = LocalDate.now();
        List<RecurringDonation> dueItems = recurringDonationRepository
                .findByActiveAndNextDueDateBetween(true, today.minusDays(1), today);

        for (RecurringDonation recurring : dueItems) {
            processSingleRecurring(recurring);
        }
    }

    private void processSingleRecurring(RecurringDonation recurring) {
        if ("TITHE".equalsIgnoreCase(recurring.getCategory())) {
            Tithe tithe = new Tithe();
            tithe.setChurchId(recurring.getChurchId());
            tithe.setMember(recurring.getMember());
            tithe.setAmount(recurring.getAmount());
            tithe.setTitheDate(LocalDate.now());
            tithe.setPaymentMethod(recurring.getPaymentMethod());
            titheRepository.save(tithe);
        } else {
            Donation donation = new Donation();
            donation.setChurchId(recurring.getChurchId());
            donation.setMember(recurring.getMember());
            donation.setAmount(recurring.getAmount());
            donation.setCategory(recurring.getCategory());
            donation.setDescription(recurring.getDescription());
            donation.setDonationDate(LocalDate.now());
            donation.setPaymentMethod(recurring.getPaymentMethod());
            donationRepository.save(donation);
        }

        recurring.setLastProcessedDate(LocalDate.now());
        recurring.setNextDueDate(calculateNextDueDate(recurring.getNextDueDate(), recurring.getFrequency()));
        recurringDonationRepository.save(recurring);

        auditLogService.log(getCurrentUserId(), "PROCESS", "RECURRING_DONATION", recurring.getId(),
                null, String.format("{\"processedDate\":\"%s\",\"nextDue\":\"%s\"}",
                        LocalDate.now(), recurring.getNextDueDate()));
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, String frequency) {
        switch (frequency.toUpperCase()) {
            case "WEEKLY":
                return currentDueDate.plusWeeks(1);
            case "MONTHLY":
                return currentDueDate.plusMonths(1);
            case "QUARTERLY":
                return currentDueDate.plusMonths(3);
            case "ANNUAL":
                return currentDueDate.plusYears(1);
            default:
                return currentDueDate.plusMonths(1);
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String email;
            if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            } else if (auth.getPrincipal() instanceof String) {
                email = (String) auth.getPrincipal();
            } else {
                return null;
            }
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
