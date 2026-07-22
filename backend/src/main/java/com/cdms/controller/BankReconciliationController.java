package com.cdms.controller;

import com.cdms.entity.BankReconciliation;
import com.cdms.entity.ReconciliationEntry;
import com.cdms.exception.BadRequestException;
import com.cdms.security.TenantContext;
import com.cdms.service.BankReconciliationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank-reconciliation")
public class BankReconciliationController {

    private final BankReconciliationService bankReconciliationService;

    public BankReconciliationController(BankReconciliationService bankReconciliationService) {
        this.bankReconciliationService = bankReconciliationService;
    }

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> startReconciliation(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate statementDate,
            @RequestParam(required = false) BigDecimal bankBalance) {
        Long churchId = TenantContext.requireChurchId();

        if (body != null) {
            if (statementDate == null && body.get("statementDate") != null) {
                statementDate = LocalDate.parse(body.get("statementDate").toString());
            }
            if (bankBalance == null && body.get("bankBalance") != null) {
                bankBalance = new BigDecimal(body.get("bankBalance").toString());
            }
        }
        if (statementDate == null || bankBalance == null) {
            throw new BadRequestException("statementDate and bankBalance are required");
        }

        BankReconciliation reconciliation = bankReconciliationService
                .startReconciliation(churchId, statementDate, bankBalance);
        return ResponseEntity.ok(bankReconciliationService.toDetailMap(reconciliation.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, Object>> getReconciliation(@PathVariable Long id) {
        return ResponseEntity.ok(bankReconciliationService.toDetailMap(id));
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
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        Long churchId = TenantContext.requireChurchId();
        List<BankReconciliation> history = bankReconciliationService.getHistory(churchId);
        return ResponseEntity.ok(history.stream().map(bankReconciliationService::toSummaryMap).toList());
    }
}
