package com.cdms.controller;

import com.cdms.entity.BankReconciliation;
import com.cdms.entity.ReconciliationEntry;
import com.cdms.security.TenantContext;
import com.cdms.service.BankReconciliationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bank-reconciliation")
public class BankReconciliationController {

    private final BankReconciliationService bankReconciliationService;

    public BankReconciliationController(BankReconciliationService bankReconciliationService) {
        this.bankReconciliationService = bankReconciliationService;
    }

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<BankReconciliation> startReconciliation(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate statementDate,
            @RequestParam BigDecimal bankBalance) {
        Long churchId = TenantContext.getChurchId();
        BankReconciliation reconciliation = bankReconciliationService
                .startReconciliation(churchId, statementDate, bankBalance);
        return ResponseEntity.ok(reconciliation);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<BankReconciliation> getReconciliation(@PathVariable Long id) {
        BankReconciliation reconciliation = bankReconciliationService.getReconciliation(id);
        return ResponseEntity.ok(reconciliation);
    }

    @PostMapping("/{id}/entries/{entryId}/match")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ReconciliationEntry> matchEntry(
            @PathVariable Long id, @PathVariable Long entryId) {
        ReconciliationEntry entry = bankReconciliationService.matchEntry(entryId);
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<BankReconciliation> completeReconciliation(@PathVariable Long id) {
        BankReconciliation reconciliation = bankReconciliationService.completeReconciliation(id);
        return ResponseEntity.ok(reconciliation);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<BankReconciliation>> getHistory() {
        Long churchId = TenantContext.getChurchId();
        List<BankReconciliation> history = bankReconciliationService.getHistory(churchId);
        return ResponseEntity.ok(history);
    }
}
