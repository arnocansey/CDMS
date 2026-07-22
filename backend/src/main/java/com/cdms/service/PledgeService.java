package com.cdms.service;

import com.cdms.dto.PledgeDto;
import com.cdms.dto.PledgePaymentDto;
import com.cdms.entity.Member;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.entity.Pledge;
import com.cdms.security.TenantContext;
import com.cdms.entity.PledgePayment;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.PledgePaymentRepository;
import com.cdms.repository.PledgeRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PledgeService {

    private final PledgeRepository pledgeRepository;
    private final PledgePaymentRepository pledgePaymentRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public PledgeService(PledgeRepository pledgeRepository, PledgePaymentRepository pledgePaymentRepository,
                         MemberRepository memberRepository, UserRepository userRepository,
                         AuditLogService auditLogService) {
        this.pledgeRepository = pledgeRepository;
        this.pledgePaymentRepository = pledgePaymentRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<PledgeDto> getAllPledges() {
        Long churchId = TenantContext.requireChurchId();
        return pledgeRepository.findByChurchId(churchId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PledgeDto getPledgeById(Long id) {
        Pledge pledge = pledgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !pledge.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Pledge", id);
        }
        return mapToDto(pledge);
    }

    @Transactional(readOnly = true)
    public List<PledgeDto> getPledgesByMember(Long memberId) {
        Long churchId = TenantContext.requireChurchId();
        return pledgeRepository.findByChurchId(churchId).stream()
                .filter(p -> p.getMember() != null && p.getMember().getId().equals(memberId))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PledgeDto> getActivePledges() {
        Long churchId = TenantContext.requireChurchId();
        return pledgeRepository.findByChurchIdAndStatus(churchId, "ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PledgeDto> getOverduePledges() {
        Long churchId = TenantContext.requireChurchId();
        return pledgeRepository.findByChurchIdAndStatus(churchId, "ACTIVE").stream()
                .filter(p -> p.getDueDate() != null && p.getDueDate().isBefore(LocalDate.now()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PledgeDto createPledge(PledgeDto dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", dto.getMemberId()));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && member.getChurchId() != null && !member.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Member", dto.getMemberId());
        }

        Pledge pledge = new Pledge();
        pledge.setChurchId(TenantContext.getChurchId());
        pledge.setMember(member);
        pledge.setPledgeType(dto.getPledgeType());
        pledge.setDescription(dto.getDescription());
        pledge.setPledgeAmount(dto.getPledgeAmount());
        pledge.setAmountPaid(BigDecimal.ZERO);
        pledge.setDueDate(dto.getDueDate());
        pledge.setStatus("ACTIVE");
        pledge.setFrequency(dto.getFrequency() != null ? dto.getFrequency() : "ONE_TIME");

        Pledge savedPledge = pledgeRepository.save(pledge);
        auditLogService.log(getCurrentUserId(), "CREATE", "PLEDGE", savedPledge.getId(),
                null, String.format("{\"memberId\":%d,\"amount\":%s}", savedPledge.getMember().getId(), savedPledge.getPledgeAmount()));
        return mapToDto(savedPledge);
    }

    @Transactional
    public PledgeDto updatePledge(Long id, PledgeDto dto) {
        Pledge pledge = pledgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && pledge.getChurchId() != null && !pledge.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Pledge", id);
        }

        String oldValue = String.format("{\"type\":\"%s\",\"amount\":%s,\"status\":\"%s\"}", pledge.getPledgeType(), pledge.getPledgeAmount(), pledge.getStatus());

        pledge.setPledgeType(dto.getPledgeType());
        pledge.setDescription(dto.getDescription());
        pledge.setPledgeAmount(dto.getPledgeAmount());
        pledge.setDueDate(dto.getDueDate());
        pledge.setStatus(dto.getStatus());
        pledge.setFrequency(dto.getFrequency());

        Pledge updatedPledge = pledgeRepository.save(pledge);
        String newValue = String.format("{\"type\":\"%s\",\"amount\":%s,\"status\":\"%s\"}", updatedPledge.getPledgeType(), updatedPledge.getPledgeAmount(), updatedPledge.getStatus());
        auditLogService.log(getCurrentUserId(), "UPDATE", "PLEDGE", updatedPledge.getId(), oldValue, newValue);
        return mapToDto(updatedPledge);
    }

    @Transactional
    public void deletePledge(Long id) {
        Pledge pledge = pledgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && pledge.getChurchId() != null && !pledge.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Pledge", id);
        }
        auditLogService.log(getCurrentUserId(), "DELETE", "PLEDGE", id,
                String.format("{\"type\":\"%s\",\"amount\":%s}", pledge.getPledgeType(), pledge.getPledgeAmount()), null);
        pledgeRepository.delete(pledge);
    }

    @Transactional
    public PledgePaymentDto recordPayment(PledgePaymentDto dto) {
        Pledge pledge = pledgeRepository.findById(dto.getPledgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Pledge", dto.getPledgeId()));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && pledge.getChurchId() != null && !pledge.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Pledge", dto.getPledgeId());
        }

        PledgePayment payment = new PledgePayment();
        payment.setPledge(pledge);
        payment.setAmount(dto.getAmount());
        payment.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setReferenceNumber(dto.getReferenceNumber());
        payment.setNotes(dto.getNotes());

        PledgePayment savedPayment = pledgePaymentRepository.save(payment);

        pledge.setAmountPaid(pledge.getAmountPaid().add(dto.getAmount()));
        if (pledge.getAmountPaid().compareTo(pledge.getPledgeAmount()) >= 0) {
            pledge.setStatus("COMPLETED");
        }
        pledgeRepository.save(pledge);

        auditLogService.log(getCurrentUserId(), "CREATE", "PLEDGE_PAYMENT", savedPayment.getId(),
                null, String.format("{\"pledgeId\":%d,\"amount\":%s}", pledge.getId(), savedPayment.getAmount()));
        return mapPaymentToDto(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PledgePaymentDto> getPledgePayments(Long pledgeId) {
        Pledge pledge = pledgeRepository.findById(pledgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge", pledgeId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && pledge.getChurchId() != null && !pledge.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Pledge", pledgeId);
        }
        return pledgePaymentRepository.findByPledgeIdOrderByPaymentDateDesc(pledgeId).stream()
                .map(this::mapPaymentToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPledgeSummary() {
        Long churchId = TenantContext.requireChurchId();
        BigDecimal totalPledged = pledgeRepository.sumPledgeAmountByChurchIdAndStatus(churchId, "ACTIVE")
                .add(pledgeRepository.sumPledgeAmountByChurchIdAndStatus(churchId, "COMPLETED"))
                .add(pledgeRepository.sumPledgeAmountByChurchIdAndStatus(churchId, "OVERDUE"));
        BigDecimal totalPaid = pledgeRepository.sumAmountPaidByChurchIdAndStatus(churchId, "ACTIVE")
                .add(pledgeRepository.sumAmountPaidByChurchIdAndStatus(churchId, "COMPLETED"))
                .add(pledgeRepository.sumAmountPaidByChurchIdAndStatus(churchId, "OVERDUE"));
        long activeCount = pledgeRepository.findByChurchIdAndStatus(churchId, "ACTIVE").size();
        long completedCount = pledgeRepository.findByChurchIdAndStatus(churchId, "COMPLETED").size();
        long overdueCount = getOverduePledges().size();
        BigDecimal totalOutstanding = totalPledged.subtract(totalPaid);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPledged", totalPledged);
        summary.put("totalPaid", totalPaid);
        summary.put("totalOutstanding", totalOutstanding);
        summary.put("activeCount", activeCount);
        summary.put("completedCount", completedCount);
        summary.put("overdueCount", overdueCount);
        return summary;
    }

    private PledgeDto mapToDto(Pledge pledge) {
        PledgeDto dto = new PledgeDto();
        dto.setId(pledge.getId());
        dto.setMemberId(pledge.getMember().getId());
        dto.setMemberName(pledge.getMember().getFirstName() + " " + pledge.getMember().getLastName());
        dto.setPledgeType(pledge.getPledgeType());
        dto.setDescription(pledge.getDescription());
        dto.setPledgeAmount(pledge.getPledgeAmount());
        dto.setAmountPaid(pledge.getAmountPaid());
        dto.setOutstandingBalance(pledge.getPledgeAmount().subtract(pledge.getAmountPaid()));
        dto.setDueDate(pledge.getDueDate());
        dto.setStatus(pledge.getStatus());
        dto.setFrequency(pledge.getFrequency());
        dto.setCreatedBy(pledge.getCreatedBy());
        return dto;
    }

    private PledgePaymentDto mapPaymentToDto(PledgePayment payment) {
        PledgePaymentDto dto = new PledgePaymentDto();
        dto.setId(payment.getId());
        dto.setPledgeId(payment.getPledge().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setNotes(payment.getNotes());
        dto.setRecordedBy(payment.getRecordedBy());
        return dto;
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
