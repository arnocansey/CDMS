package com.cdms.controller;

import com.cdms.dto.BudgetDto;
import com.cdms.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<BudgetDto>> getBudgets(
            @RequestParam(required = false) String period) {
        List<BudgetDto> budgets;
        if (period != null && !period.isEmpty()) {
            budgets = budgetService.getBudgetsByPeriod(period);
        } else {
            budgets = budgetService.getAllBudgets();
        }
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, BigDecimal>> getBudgetSummary(
            @RequestParam String period) {
        Map<String, BigDecimal> summary = budgetService.getBudgetSummary(period);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<BudgetDto> createBudget(@Valid @RequestBody BudgetDto budgetDto) {
        BudgetDto budget = budgetService.createBudget(budgetDto);
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<BudgetDto> updateBudget(@PathVariable Long id, @Valid @RequestBody BudgetDto budgetDto) {
        BudgetDto budget = budgetService.updateBudget(id, budgetDto);
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }
}
