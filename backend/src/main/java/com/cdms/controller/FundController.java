package com.cdms.controller;

import com.cdms.dto.FundDto;
import com.cdms.dto.FundTransactionDto;
import com.cdms.service.FundService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funds")
public class FundController {

    private final FundService fundService;

    public FundController(FundService fundService) {
        this.fundService = fundService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<FundDto>> getAllFunds() {
        List<FundDto> funds = fundService.getAllFunds();
        return ResponseEntity.ok(funds);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<FundDto>> getActiveFunds() {
        List<FundDto> funds = fundService.getActiveFunds();
        return ResponseEntity.ok(funds);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, Object>> getFundSummary() {
        Map<String, Object> summary = fundService.getFundSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<FundDto> getFundById(@PathVariable Long id) {
        FundDto fund = fundService.getFundById(id);
        return ResponseEntity.ok(fund);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<FundDto> createFund(@Valid @RequestBody FundDto fundDto) {
        FundDto fund = fundService.createFund(fundDto);
        return ResponseEntity.ok(fund);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<FundDto> updateFund(@PathVariable Long id, @Valid @RequestBody FundDto fundDto) {
        FundDto fund = fundService.updateFund(id, fundDto);
        return ResponseEntity.ok(fund);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFund(@PathVariable Long id) {
        fundService.deleteFund(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<FundTransactionDto> recordFundTransaction(@Valid @RequestBody FundTransactionDto transactionDto) {
        FundTransactionDto transaction = fundService.recordFundTransaction(transactionDto);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{fundId}/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<FundTransactionDto>> getFundTransactions(@PathVariable Long fundId) {
        List<FundTransactionDto> transactions = fundService.getFundTransactions(fundId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{fundId}/transactions/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<FundTransactionDto>> getFundTransactionsByDateRange(
            @PathVariable Long fundId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<FundTransactionDto> transactions = fundService.getFundTransactionsByDateRange(fundId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
}
