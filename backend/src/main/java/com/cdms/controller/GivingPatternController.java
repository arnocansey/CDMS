package com.cdms.controller;

import com.cdms.security.TenantContext;
import com.cdms.service.GivingPatternService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/giving-patterns")
public class GivingPatternController {

    private final GivingPatternService givingPatternService;

    public GivingPatternController(GivingPatternService givingPatternService) {
        this.givingPatternService = givingPatternService;
    }

    @GetMapping("/heatmap")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, BigDecimal>> getGivingHeatmap(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        Map<String, BigDecimal> heatmap = givingPatternService.getGivingHeatmap(churchId, from, to);
        return ResponseEntity.ok(heatmap);
    }

    @GetMapping("/by-day")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, BigDecimal>> getGivingByDayOfWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        Map<String, BigDecimal> result = givingPatternService.getGivingByDayOfWeek(churchId, from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-month")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, BigDecimal>> getGivingByMonth(@RequestParam int year) {
        Long churchId = TenantContext.getChurchId();
        Map<String, BigDecimal> result = givingPatternService.getGivingByMonth(churchId, year);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-donors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<List<Map<String, Object>>> getTopDonors(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        Long churchId = TenantContext.getChurchId();
        List<Map<String, Object>> result = givingPatternService.getTopDonors(churchId, from, to, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, Long>> getDonationSizeDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        Map<String, Long> result = givingPatternService.getDonationSizeDistribution(churchId, from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/frequency")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, Long>> getGivingFrequency(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        Map<String, Long> result = givingPatternService.getGivingFrequencyDistribution(churchId, from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/average")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<BigDecimal> getAverageGiftSize(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        BigDecimal result = givingPatternService.getAverageGiftSize(churchId, from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/retention-frequency")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getRetentionVsFrequency() {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> result = givingPatternService.getRetentionVsFrequency(churchId);
        return ResponseEntity.ok(result);
    }
}
