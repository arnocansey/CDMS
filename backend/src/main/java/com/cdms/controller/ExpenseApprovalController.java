package com.cdms.controller;

import com.cdms.entity.Expense;
import com.cdms.security.TenantContext;
import com.cdms.service.ExpenseApprovalService;
import com.cdms.service.UserService;
import com.cdms.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ExpenseApprovalController {

    private final ExpenseApprovalService expenseApprovalService;
    private final UserService userService;

    public ExpenseApprovalController(ExpenseApprovalService expenseApprovalService, UserService userService) {
        this.expenseApprovalService = expenseApprovalService;
        this.userService = userService;
    }

    @GetMapping("/api/expenses/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<Expense>> getPendingExpenses() {
        Long churchId = TenantContext.requireChurchId();
        List<Expense> pending = expenseApprovalService.getPendingExpenses(churchId);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/api/expenses/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Expense> approveExpense(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        Expense approved = expenseApprovalService.approveExpense(id, userId);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/api/expenses/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Expense> rejectExpense(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String reason = body.get("reason");
        Expense rejected = expenseApprovalService.rejectExpense(id, userId, reason);
        return ResponseEntity.ok(rejected);
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
            return userService.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
