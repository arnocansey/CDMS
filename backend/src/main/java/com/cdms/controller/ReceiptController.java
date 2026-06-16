package com.cdms.controller;

import com.cdms.dto.ReceiptDto;
import com.cdms.service.ReceiptService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<ReceiptDto>> getReceiptsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ReceiptDto> receipts = receiptService.getReceiptsByDateRange(startDate, endDate);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ReceiptDto> getReceiptById(@PathVariable Long id) {
        ReceiptDto receipt = receiptService.getReceiptById(id);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/number/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ReceiptDto> getReceiptByNumber(@PathVariable String receiptNumber) {
        ReceiptDto receipt = receiptService.getReceiptByNumber(receiptNumber);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'SECRETARY')")
    public ResponseEntity<List<ReceiptDto>> getReceiptsByMember(@PathVariable Long memberId) {
        List<ReceiptDto> receipts = receiptService.getReceiptsByMember(memberId);
        return ResponseEntity.ok(receipts);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ReceiptDto> generateReceipt(@Valid @RequestBody ReceiptDto receiptDto) {
        ReceiptDto receipt = receiptService.generateReceipt(receiptDto);
        return ResponseEntity.ok(receipt);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ReceiptDto> updateReceiptStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        ReceiptDto receipt = receiptService.updateReceiptStatus(id, status);
        return ResponseEntity.ok(receipt);
    }
}
