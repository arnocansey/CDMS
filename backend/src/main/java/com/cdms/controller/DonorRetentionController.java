package com.cdms.controller;

import com.cdms.entity.DonorRetention;
import com.cdms.security.TenantContext;
import com.cdms.service.DonorRetentionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/donor-retention")
public class DonorRetentionController {

    private final DonorRetentionService donorRetentionService;

    public DonorRetentionController(DonorRetentionService donorRetentionService) {
        this.donorRetentionService = donorRetentionService;
    }

    @GetMapping("/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<List<DonorRetention>> calculateRetention(@RequestParam String period) {
        Long churchId = TenantContext.getChurchId();
        List<DonorRetention> results = donorRetentionService.calculateRetention(churchId, period);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getRetentionReport(@RequestParam String period) {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> report = donorRetentionService.getRetentionReport(churchId, period);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER')")
    public ResponseEntity<List<Map<String, Object>>> getRetentionTrend(
            @RequestParam(defaultValue = "4") int quarters) {
        Long churchId = TenantContext.getChurchId();
        List<Map<String, Object>> trend = donorRetentionService.getRetentionTrend(churchId, quarters);
        return ResponseEntity.ok(trend);
    }
}
