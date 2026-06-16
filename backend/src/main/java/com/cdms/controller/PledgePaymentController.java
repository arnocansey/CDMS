package com.cdms.controller;

import com.cdms.dto.PledgePaymentDto;
import com.cdms.service.PledgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pledge-payments")
public class PledgePaymentController {

    private final PledgeService pledgeService;

    public PledgePaymentController(PledgeService pledgeService) {
        this.pledgeService = pledgeService;
    }

    @GetMapping("/by-pledge/{pledgeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<PledgePaymentDto>> getPaymentsByPledge(@PathVariable Long pledgeId) {
        List<PledgePaymentDto> payments = pledgeService.getPledgePayments(pledgeId);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<PledgePaymentDto> recordPayment(@Valid @RequestBody PledgePaymentDto paymentDto) {
        PledgePaymentDto payment = pledgeService.recordPayment(paymentDto);
        return ResponseEntity.ok(payment);
    }
}
