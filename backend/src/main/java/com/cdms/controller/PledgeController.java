package com.cdms.controller;

import com.cdms.dto.PledgeDto;
import com.cdms.dto.PledgePaymentDto;
import com.cdms.service.PledgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pledges")
public class PledgeController {

    private final PledgeService pledgeService;

    public PledgeController(PledgeService pledgeService) {
        this.pledgeService = pledgeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<PledgeDto>> getAllPledges() {
        List<PledgeDto> pledges = pledgeService.getAllPledges();
        return ResponseEntity.ok(pledges);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<PledgeDto>> getActivePledges() {
        List<PledgeDto> pledges = pledgeService.getActivePledges();
        return ResponseEntity.ok(pledges);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<PledgeDto>> getOverduePledges() {
        List<PledgeDto> pledges = pledgeService.getOverduePledges();
        return ResponseEntity.ok(pledges);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<?> getPledgeSummary() {
        Object summary = pledgeService.getPledgeSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<PledgeDto> getPledgeById(@PathVariable Long id) {
        PledgeDto pledge = pledgeService.getPledgeById(id);
        return ResponseEntity.ok(pledge);
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<PledgeDto>> getPledgesByMember(@PathVariable Long memberId) {
        List<PledgeDto> pledges = pledgeService.getPledgesByMember(memberId);
        return ResponseEntity.ok(pledges);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<PledgeDto> createPledge(@Valid @RequestBody PledgeDto pledgeDto) {
        PledgeDto pledge = pledgeService.createPledge(pledgeDto);
        return ResponseEntity.ok(pledge);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<PledgeDto> updatePledge(@PathVariable Long id, @Valid @RequestBody PledgeDto pledgeDto) {
        PledgeDto pledge = pledgeService.updatePledge(id, pledgeDto);
        return ResponseEntity.ok(pledge);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePledge(@PathVariable Long id) {
        pledgeService.deletePledge(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<PledgePaymentDto> recordPayment(@Valid @RequestBody PledgePaymentDto paymentDto) {
        PledgePaymentDto payment = pledgeService.recordPayment(paymentDto);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{pledgeId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<PledgePaymentDto>> getPledgePayments(@PathVariable Long pledgeId) {
        List<PledgePaymentDto> payments = pledgeService.getPledgePayments(pledgeId);
        return ResponseEntity.ok(payments);
    }
}
