package com.cdms.service;

import com.cdms.dto.FinancialGoalDto;
import com.cdms.dto.GoalContributionDto;
import com.cdms.entity.FinancialGoal;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.entity.GoalContribution;
import com.cdms.security.TenantContext;
import com.cdms.entity.Member;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.FinancialGoalRepository;
import com.cdms.repository.GoalContributionRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinancialGoalService {

    private final FinancialGoalRepository financialGoalRepository;
    private final GoalContributionRepository goalContributionRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public FinancialGoalService(FinancialGoalRepository financialGoalRepository,
                                GoalContributionRepository goalContributionRepository,
                                MemberRepository memberRepository, UserRepository userRepository,
                                AuditLogService auditLogService) {
        this.financialGoalRepository = financialGoalRepository;
        this.goalContributionRepository = goalContributionRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<FinancialGoalDto> getAllGoals() {
        return financialGoalRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FinancialGoalDto getGoalById(Long id) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", id));
        return mapToDto(goal);
    }

    public List<FinancialGoalDto> getActiveGoals() {
        return financialGoalRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FinancialGoalDto createGoal(FinancialGoalDto dto) {
        FinancialGoal goal = new FinancialGoal();
        goal.setChurchId(TenantContext.getChurchId());
        goal.setName(dto.getName());
        goal.setDescription(dto.getDescription());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setAmountRaised(BigDecimal.ZERO);
        goal.setStartDate(dto.getStartDate());
        goal.setEndDate(dto.getEndDate());
        goal.setStatus("ACTIVE");
        goal.setCategory(dto.getCategory());

        FinancialGoal savedGoal = financialGoalRepository.save(goal);
        auditLogService.log(getCurrentUserId(), "CREATE", "FINANCIAL_GOAL", savedGoal.getId(),
                null, String.format("{\"name\":\"%s\",\"target\":%s}", savedGoal.getName(), savedGoal.getTargetAmount()));
        return mapToDto(savedGoal);
    }

    public FinancialGoalDto updateGoal(Long id, FinancialGoalDto dto) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", id));

        String oldValue = String.format("{\"name\":\"%s\",\"target\":%s,\"raised\":%s}", goal.getName(), goal.getTargetAmount(), goal.getAmountRaised());

        goal.setName(dto.getName());
        goal.setDescription(dto.getDescription());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setStartDate(dto.getStartDate());
        goal.setEndDate(dto.getEndDate());
        goal.setStatus(dto.getStatus());
        goal.setCategory(dto.getCategory());

        FinancialGoal updatedGoal = financialGoalRepository.save(goal);
        String newValue = String.format("{\"name\":\"%s\",\"target\":%s,\"raised\":%s}", updatedGoal.getName(), updatedGoal.getTargetAmount(), updatedGoal.getAmountRaised());
        auditLogService.log(getCurrentUserId(), "UPDATE", "FINANCIAL_GOAL", updatedGoal.getId(), oldValue, newValue);
        return mapToDto(updatedGoal);
    }

    public void deleteGoal(Long id) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", id));
        auditLogService.log(getCurrentUserId(), "DELETE", "FINANCIAL_GOAL", id,
                String.format("{\"name\":\"%s\"}", goal.getName()), null);
        financialGoalRepository.deleteById(id);
    }

    @Transactional
    public GoalContributionDto recordContribution(GoalContributionDto dto) {
        FinancialGoal goal = financialGoalRepository.findById(dto.getGoalId())
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", dto.getGoalId()));

        GoalContribution contribution = new GoalContribution();
        contribution.setGoal(goal);
        contribution.setAmount(dto.getAmount());
        contribution.setContributionDate(dto.getContributionDate() != null ? dto.getContributionDate() : LocalDate.now());
        contribution.setPaymentMethod(dto.getPaymentMethod());
        contribution.setReferenceNumber(dto.getReferenceNumber());
        contribution.setNotes(dto.getNotes());

        if (dto.getMemberId() != null) {
            Member member = memberRepository.findById(dto.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", dto.getMemberId()));
            contribution.setMember(member);
        }

        GoalContribution savedContribution = goalContributionRepository.save(contribution);

        goal.setAmountRaised(goal.getAmountRaised().add(dto.getAmount()));
        if (goal.getAmountRaised().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }
        financialGoalRepository.save(goal);

        auditLogService.log(getCurrentUserId(), "CREATE", "GOAL_CONTRIBUTION", savedContribution.getId(),
                null, String.format("{\"goalId\":%d,\"amount\":%s}", goal.getId(), savedContribution.getAmount()));
        return mapContributionToDto(savedContribution);
    }

    @Transactional(readOnly = true)
    public List<GoalContributionDto> getGoalContributions(Long goalId) {
        return goalContributionRepository.findByGoalIdOrderByContributionDateDesc(goalId).stream()
                .map(this::mapContributionToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getGoalSummary() {
        List<FinancialGoal> allGoals = financialGoalRepository.findAll();
        List<FinancialGoal> activeGoals = financialGoalRepository.findByStatus("ACTIVE");

        BigDecimal totalTarget = allGoals.stream()
                .map(FinancialGoal::getTargetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRaised = allGoals.stream()
                .map(FinancialGoal::getAmountRaised)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGoals", allGoals.size());
        summary.put("activeGoals", activeGoals.size());
        summary.put("totalTarget", totalTarget);
        summary.put("totalRaised", totalRaised);
        return summary;
    }

    private FinancialGoalDto mapToDto(FinancialGoal goal) {
        FinancialGoalDto dto = new FinancialGoalDto();
        dto.setId(goal.getId());
        dto.setName(goal.getName());
        dto.setDescription(goal.getDescription());
        dto.setTargetAmount(goal.getTargetAmount());
        dto.setAmountRaised(goal.getAmountRaised());
        dto.setRemainingBalance(goal.getTargetAmount().subtract(goal.getAmountRaised()));
        dto.setPercentageCompletion(goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getAmountRaised().multiply(BigDecimal.valueOf(100)).divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        dto.setStartDate(goal.getStartDate());
        dto.setEndDate(goal.getEndDate());
        dto.setStatus(goal.getStatus());
        dto.setCategory(goal.getCategory());
        dto.setCreatedBy(goal.getCreatedBy());
        return dto;
    }

    private GoalContributionDto mapContributionToDto(GoalContribution contribution) {
        GoalContributionDto dto = new GoalContributionDto();
        dto.setId(contribution.getId());
        dto.setGoalId(contribution.getGoal().getId());
        if (contribution.getMember() != null) {
            dto.setMemberId(contribution.getMember().getId());
            dto.setMemberName(contribution.getMember().getFirstName() + " " + contribution.getMember().getLastName());
        }
        dto.setAmount(contribution.getAmount());
        dto.setContributionDate(contribution.getContributionDate());
        dto.setPaymentMethod(contribution.getPaymentMethod());
        dto.setReferenceNumber(contribution.getReferenceNumber());
        dto.setNotes(contribution.getNotes());
        dto.setRecordedBy(contribution.getRecordedBy());
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
