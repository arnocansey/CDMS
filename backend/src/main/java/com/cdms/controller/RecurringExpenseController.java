package com.cdms.controller;

import com.cdms.entity.RecurringExpense;
import com.cdms.security.TenantContext;
import com.cdms.service.RecurringExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        Long churchId = TenantContext.getChurchId();
        List<RecurringExpense> expenses = recurringExpenseService.getAll(churchId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringExpense> create(@RequestBody RecurringExpense recurringExpense) {
        Long churchId = TenantContext.getChurchId();
        recurringExpense.setChurchId(churchId);
        RecurringExpense created = recurringExpenseService.create(recurringExpense);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringExpense> cancel(@PathVariable Long id) {
        RecurringExpense cancelled = recurringExpenseService.cancel(id);
        return ResponseEntity.ok(cancelled);
    }
}
