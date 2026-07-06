package com.cdms.service;

import com.cdms.entity.Church;
import com.cdms.entity.Expense;
import com.cdms.entity.Role;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseApprovalService {

    private final ExpenseRepository expenseRepository;
    private final ChurchRepository churchRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ExpenseApprovalService(ExpenseRepository expenseRepository,
                                   ChurchRepository churchRepository,
                                   UserRepository userRepository,
                                   NotificationService notificationService,
                                   AuditLogService auditLogService) {
        this.expenseRepository = expenseRepository;
        this.churchRepository = churchRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Expense submitExpense(Expense expense) {
        if (expense.getChurchId() == null) {
            expense.setChurchId(TenantContext.getChurchId());
        }
        if (expense.getChurchId() != null) {
            Church church = churchRepository.findById(expense.getChurchId()).orElse(null);
            if (church != null) {
                BigDecimal threshold = church.getExpenseApprovalThreshold();
                if (threshold != null && threshold.compareTo(BigDecimal.ZERO) > 0
                        && expense.getAmount().compareTo(threshold) > 0) {
                    expense.setApprovalStatus("PENDING");
                } else {
                    expense.setApprovalStatus("APPROVED");
                }
            }
        }

        Expense saved = expenseRepository.save(expense);

        if ("PENDING".equals(saved.getApprovalStatus())) {
            notifyAdminsOfPendingExpense(saved);
        }

        auditLogService.log(getCurrentUserId(), "SUBMIT", "EXPENSE", saved.getId(),
                null, String.format("{\"amount\":%s,\"status\":\"%s\"}", saved.getAmount(), saved.getApprovalStatus()));
        return saved;
    }

    @Transactional
    public Expense approveExpense(Long expenseId, Long userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        expense.setApprovalStatus("APPROVED");
        expense.setApprovedById(userId);
        expense.setApprovedAt(LocalDateTime.now());
        Expense saved = expenseRepository.save(expense);

        auditLogService.log(userId, "APPROVE", "EXPENSE", saved.getId(),
                "{\"approvalStatus\":\"PENDING\"}", "{\"approvalStatus\":\"APPROVED\"}");
        return saved;
    }

    @Transactional
    public Expense rejectExpense(Long expenseId, Long userId, String reason) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        expense.setApprovalStatus("REJECTED");
        expense.setApprovedById(userId);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setRejectionReason(reason);
        Expense saved = expenseRepository.save(expense);

        auditLogService.log(userId, "REJECT", "EXPENSE", saved.getId(),
                "{\"approvalStatus\":\"PENDING\"}",
                String.format("{\"approvalStatus\":\"REJECTED\",\"reason\":\"%s\"}", reason));
        return saved;
    }

    public List<Expense> getPendingExpenses(Long churchId) {
        return expenseRepository.findByChurchId(churchId).stream()
                .filter(e -> "PENDING".equals(e.getApprovalStatus()))
                .toList();
    }

    private void notifyAdminsOfPendingExpense(Expense expense) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getChurch() != null && u.getChurch().getId().equals(expense.getChurchId()))
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == Role.RoleName.ROLE_ADMIN))
                .toList();

        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getChurchId(),
                    admin.getId(),
                    "Expense Pending Approval",
                    String.format("An expense of $%s for %s requires your approval.",
                            expense.getAmount(), expense.getCategory()),
                    "EXPENSE_APPROVAL"
            );
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
