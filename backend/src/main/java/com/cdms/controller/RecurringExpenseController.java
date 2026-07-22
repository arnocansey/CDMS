package com.cdms.controller;

import com.cdms.entity.RecurringExpense;
import com.cdms.security.TenantContext;
import com.cdms.service.RecurringExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-expenses")
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    public RecurringExpenseController(RecurringExpenseService recurringExpenseService) {
        this.recurringExpenseService = recurringExpenseService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<RecurringExpense>> listActive() {
        Long churchId = TenantContext.requireChurchId();
        List<RecurringExpense> expenses = recurringExpenseService.getAll(churchId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringExpense> create(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.requireChurchId();
        RecurringExpense created = recurringExpenseService.createFromRequest(churchId, body);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringExpense> cancel(@PathVariable Long id) {
        RecurringExpense cancelled = recurringExpenseService.cancel(id);
        return ResponseEntity.ok(cancelled);
    }
}
