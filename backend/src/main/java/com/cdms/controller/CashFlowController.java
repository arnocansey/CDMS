package com.cdms.controller;

import com.cdms.dto.CashFlowEntryDto;
import com.cdms.dto.CashFlowStatementDto;
import com.cdms.service.CashFlowService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cash-flow")
public class CashFlowController {

    private final CashFlowService cashFlowService;

    public CashFlowController(CashFlowService cashFlowService) {
        this.cashFlowService = cashFlowService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<CashFlowEntryDto>> getAllEntries() {
        List<CashFlowEntryDto> entries = cashFlowService.getAllEntries();
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<CashFlowEntryDto>> getEntriesByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        List<CashFlowEntryDto> entries = cashFlowService.getEntriesByDateRange(start, end);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/statement")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<CashFlowStatementDto> getCashFlowStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        CashFlowStatementDto statement = cashFlowService.getCashFlowStatement(start, end);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<CashFlowStatementDto> getDailyCashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        CashFlowStatementDto statement = cashFlowService.getDailyCashFlow(date);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<CashFlowStatementDto> getMonthlyCashFlow(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        CashFlowStatementDto statement = cashFlowService.getMonthlyCashFlow(year, month);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/annual")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<CashFlowStatementDto> getAnnualCashFlow(@RequestParam Integer year) {
        CashFlowStatementDto statement = cashFlowService.getAnnualCashFlow(year);
        return ResponseEntity.ok(statement);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<CashFlowEntryDto> createEntry(@Valid @RequestBody CashFlowEntryDto entryDto) {
        CashFlowEntryDto entry = cashFlowService.createEntry(entryDto);
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        cashFlowService.deleteEntry(id);
        return ResponseEntity.ok().build();
    }
}
