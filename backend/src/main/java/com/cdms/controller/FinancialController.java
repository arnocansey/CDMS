package com.cdms.controller;

import com.cdms.dto.*;
import com.cdms.service.FinancialService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping("/donations")
    public ResponseEntity<List<DonationDto>> getDonations(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DonationDto> donations = financialService.getDonations(startDate, endDate);
        return ResponseEntity.ok(donations);
    }

    @PostMapping("/donations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<DonationDto> createDonation(@Valid @RequestBody DonationDto donationDto) {
        DonationDto donation = financialService.createDonation(donationDto);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/tithes")
    public ResponseEntity<List<TitheDto>> getTithes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TitheDto> tithes = financialService.getTithes(startDate, endDate);
        return ResponseEntity.ok(tithes);
    }

    @PostMapping("/tithes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<TitheDto> createTithe(@Valid @RequestBody TitheDto titheDto) {
        TitheDto tithe = financialService.createTithe(titheDto);
        return ResponseEntity.ok(tithe);
    }

    @GetMapping("/offerings")
    public ResponseEntity<List<OfferingDto>> getOfferings(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<OfferingDto> offerings = financialService.getOfferings(startDate, endDate);
        return ResponseEntity.ok(offerings);
    }

    @PostMapping("/offerings")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<OfferingDto> createOffering(@Valid @RequestBody OfferingDto offeringDto) {
        OfferingDto offering = financialService.createOffering(offeringDto);
        return ResponseEntity.ok(offering);
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseDto>> getExpenses(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ExpenseDto> expenses = financialService.getExpenses(startDate, endDate);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ExpenseDto> createExpense(@Valid @RequestBody ExpenseDto expenseDto) {
        ExpenseDto expense = financialService.createExpense(expenseDto);
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/members/{memberId}/contributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER')")
    public ResponseEntity<MemberContributionHistoryDto> getMemberContributionHistory(@PathVariable Long memberId) {
        MemberContributionHistoryDto history = financialService.getMemberContributionHistory(memberId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/contributors/top")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<List<Map<String, Object>>> getTopContributors(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> contributors = financialService.getTopContributors(limit);
        return ResponseEntity.ok(contributors);
    }

    @GetMapping("/contributions/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getContributionSummaryByPeriod(
            @RequestParam String period) {
        Map<String, Object> summary = financialService.getContributionSummaryByPeriod(period);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getFinanceSummary() {
        Map<String, Object> summary = financialService.getFinanceSummary();
        return ResponseEntity.ok(summary);
    }
}
