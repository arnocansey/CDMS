package com.cdms.controller;

import com.cdms.entity.RecurringDonation;
import com.cdms.security.TenantContext;
import com.cdms.service.RecurringDonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-donations")
public class RecurringDonationController {

    private final RecurringDonationService recurringDonationService;

    public RecurringDonationController(RecurringDonationService recurringDonationService) {
        this.recurringDonationService = recurringDonationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<RecurringDonation>> getActiveRecurring() {
        Long churchId = TenantContext.requireChurchId();
        List<RecurringDonation> recurring = recurringDonationService.getActiveRecurring(churchId);
        return ResponseEntity.ok(recurring);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringDonation> create(@RequestBody Map<String, Object> body) {
        RecurringDonation saved = recurringDonationService.createFromRequest(body);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<RecurringDonation> cancel(@PathVariable Long id) {
        RecurringDonation cancelled = recurringDonationService.cancel(id);
        return ResponseEntity.ok(cancelled);
    }
}
