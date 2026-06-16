package com.cdms.controller;

import com.cdms.dto.PrayerRequestDto;
import com.cdms.service.PrayerRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prayer-requests")
public class PrayerRequestController {

    private final PrayerRequestService prayerRequestService;

    public PrayerRequestController(PrayerRequestService prayerRequestService) {
        this.prayerRequestService = prayerRequestService;
    }

    @GetMapping
    public ResponseEntity<List<PrayerRequestDto>> getAllPrayerRequests() {
        List<PrayerRequestDto> prayerRequests = prayerRequestService.getAllPrayerRequests();
        return ResponseEntity.ok(prayerRequests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PrayerRequestDto>> getPendingPrayerRequests() {
        List<PrayerRequestDto> prayerRequests = prayerRequestService.getPendingPrayerRequests();
        return ResponseEntity.ok(prayerRequests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrayerRequestDto> getPrayerRequestById(@PathVariable Long id) {
        PrayerRequestDto prayerRequest = prayerRequestService.getPrayerRequestById(id);
        return ResponseEntity.ok(prayerRequest);
    }

    @PostMapping
    public ResponseEntity<PrayerRequestDto> createPrayerRequest(@Valid @RequestBody PrayerRequestDto prayerRequestDto) {
        PrayerRequestDto prayerRequest = prayerRequestService.createPrayerRequest(prayerRequestDto);
        return ResponseEntity.ok(prayerRequest);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<PrayerRequestDto> approvePrayerRequest(@PathVariable Long id, Authentication authentication) {
        PrayerRequestDto prayerRequest = prayerRequestService.approvePrayerRequest(id, authentication.getName());
        return ResponseEntity.ok(prayerRequest);
    }

    @PutMapping("/{id}/answered")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<PrayerRequestDto> markAsAnswered(@PathVariable Long id) {
        PrayerRequestDto prayerRequest = prayerRequestService.markAsAnswered(id);
        return ResponseEntity.ok(prayerRequest);
    }
}
