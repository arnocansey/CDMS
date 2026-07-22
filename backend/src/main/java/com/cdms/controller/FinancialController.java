package com.cdms.controller;

import com.cdms.dto.*;
import com.cdms.service.FinancialService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Page<DonationDto>> getDonations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 1000) Pageable pageable) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        Page<DonationDto> donations = financialService.getDonations(start, end, pageable);
        return ResponseEntity.ok(donations);
    }

    @PostMapping("/donations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<DonationDto> createDonation(@Valid @RequestBody DonationDto donationDto) {
        DonationDto donation = financialService.createDonation(donationDto);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/tithes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Page<TitheDto>> getTithes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 1000) Pageable pageable) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        Page<TitheDto> tithes = financialService.getTithes(start, end, pageable);
        return ResponseEntity.ok(tithes);
    }

    @PostMapping("/tithes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<TitheDto> createTithe(@Valid @RequestBody TitheDto titheDto) {
        TitheDto tithe = financialService.createTithe(titheDto);
        return ResponseEntity.ok(tithe);
    }

    @GetMapping("/offerings")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Page<OfferingDto>> getOfferings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 1000) Pageable pageable) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        Page<OfferingDto> offerings = financialService.getOfferings(start, end, pageable);
        return ResponseEntity.ok(offerings);
    }

    @PostMapping("/offerings")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<OfferingDto> createOffering(@Valid @RequestBody OfferingDto offeringDto) {
        OfferingDto offering = financialService.createOffering(offeringDto);
        return ResponseEntity.ok(offering);
    }

    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Page<ExpenseDto>> getExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 1000) Pageable pageable) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        Page<ExpenseDto> expenses = financialService.getExpenses(start, end, pageable);
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
