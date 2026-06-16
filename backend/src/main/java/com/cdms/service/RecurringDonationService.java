package com.cdms.service;

import com.cdms.entity.Donation;
import com.cdms.entity.RecurringDonation;
import com.cdms.entity.Tithe;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.RecurringDonationRepository;
import com.cdms.repository.TitheRepository;
import com.cdms.repository.UserRepository;
import com.cdms.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringDonationService {

    private final RecurringDonationRepository recurringDonationRepository;
    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public RecurringDonationService(RecurringDonationRepository recurringDonationRepository,
                                     DonationRepository donationRepository,
                                     TitheRepository titheRepository,
                                     UserRepository userRepository,
                                     AuditLogService auditLogService) {
        this.recurringDonationRepository = recurringDonationRepository;
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public RecurringDonation create(RecurringDonation recurringDonation) {
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
        if (auth != null && auth.getPrincipal() instanceof String) {
            String email = (String) auth.getPrincipal();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
