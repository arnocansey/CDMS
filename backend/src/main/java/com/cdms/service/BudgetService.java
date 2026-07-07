package com.cdms.service;

import com.cdms.dto.BudgetDto;
import com.cdms.entity.Budget;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.BudgetRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository,
                        AuditLogService auditLogService) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<BudgetDto> getAllBudgets() {
        return budgetRepository.findByChurchId(TenantContext.getChurchId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BudgetDto> getBudgetsByPeriod(String period) {
        return budgetRepository.findByChurchId(TenantContext.getChurchId()).stream()
                .filter(b -> period.equals(b.getPeriod()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetDto createBudget(BudgetDto budgetDto) {
        Budget budget = new Budget();
        budget.setChurchId(TenantContext.getChurchId());
        budget.setName(budgetDto.getName());
        budget.setCategory(budgetDto.getCategory());
        budget.setAmount(budgetDto.getAmount());
        budget.setSpent(budgetDto.getSpent() != null ? budgetDto.getSpent() : BigDecimal.ZERO);
        budget.setPeriod(budgetDto.getPeriod());
        budget.setStartDate(budgetDto.getStartDate());
        budget.setEndDate(budgetDto.getEndDate());
        budget.setNotes(budgetDto.getNotes());

        Budget savedBudget = budgetRepository.save(budget);
        auditLogService.log(getCurrentUserId(), "CREATE", "BUDGET", savedBudget.getId(),
                null, String.format("{\"name\":\"%s\",\"amount\":%s}", savedBudget.getName(), savedBudget.getAmount()));
        return mapToDto(savedBudget);
    }

    @Transactional
    public BudgetDto updateBudget(Long id, BudgetDto budgetDto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        if (!budget.getChurchId().equals(TenantContext.getChurchId())) {
            throw new ResourceNotFoundException("Budget", id);
        }

        String oldValue = String.format("{\"name\":\"%s\",\"amount\":%s}", budget.getName(), budget.getAmount());

        budget.setName(budgetDto.getName());
        budget.setCategory(budgetDto.getCategory());
        budget.setAmount(budgetDto.getAmount());
        budget.setSpent(budgetDto.getSpent());
        budget.setPeriod(budgetDto.getPeriod());
        budget.setStartDate(budgetDto.getStartDate());
        budget.setEndDate(budgetDto.getEndDate());
        budget.setNotes(budgetDto.getNotes());

        Budget updatedBudget = budgetRepository.save(budget);
        String newValue = String.format("{\"name\":\"%s\",\"amount\":%s}", updatedBudget.getName(), updatedBudget.getAmount());
        auditLogService.log(getCurrentUserId(), "UPDATE", "BUDGET", updatedBudget.getId(), oldValue, newValue);
        return mapToDto(updatedBudget);
    }

    @Transactional
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        if (!budget.getChurchId().equals(TenantContext.getChurchId())) {
            throw new ResourceNotFoundException("Budget", id);
        }
        auditLogService.log(getCurrentUserId(), "DELETE", "BUDGET", id,
                String.format("{\"name\":\"%s\"}", budget.getName()), null);
        budgetRepository.delete(budget);
    }

    public Map<String, BigDecimal> getBudgetSummary(String period) {
        List<Budget> budgets = budgetRepository.findByChurchId(TenantContext.getChurchId()).stream()
                .filter(b -> period.equals(b.getPeriod()))
                .collect(Collectors.toList());

        BigDecimal totalBudgeted = budgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = budgets.stream()
                .map(b -> b.getSpent() != null ? b.getSpent() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalBudgeted.subtract(totalSpent);

        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalBudgeted", totalBudgeted);
        summary.put("totalSpent", totalSpent);
        summary.put("remaining", remaining);
        return summary;
    }

    private BudgetDto mapToDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setName(budget.getName());
        dto.setCategory(budget.getCategory());
        dto.setAmount(budget.getAmount());
        dto.setSpent(budget.getSpent());
        dto.setPeriod(budget.getPeriod());
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        dto.setNotes(budget.getNotes());
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
