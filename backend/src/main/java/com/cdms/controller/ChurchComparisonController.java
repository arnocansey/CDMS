package com.cdms.controller;

import com.cdms.service.ChurchComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/church-comparison")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class ChurchComparisonController {

    private final ChurchComparisonService churchComparisonService;

    public ChurchComparisonController(ChurchComparisonService churchComparisonService) {
        this.churchComparisonService = churchComparisonService;
    }

    @GetMapping("/metrics/{churchId}")
    public ResponseEntity<Map<String, Object>> getChurchMetrics(@PathVariable Long churchId) {
        Map<String, Object> metrics = churchComparisonService.getChurchMetrics(churchId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/compare")
    public ResponseEntity<List<Map<String, Object>>> compareChurches(@RequestParam String ids) {
        List<Long> churchIds = Arrays.stream(ids.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());
        List<Map<String, Object>> comparison = churchComparisonService.compareChurches(churchIds);
        return ResponseEntity.ok(comparison);
    }

    @GetMapping("/top-giving")
    public ResponseEntity<List<Map<String, Object>>> getTopChurchesByGiving(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> topGiving = churchComparisonService.getTopChurchesByGiving(limit);
        return ResponseEntity.ok(topGiving);
    }

    @GetMapping("/top-growth")
    public ResponseEntity<List<Map<String, Object>>> getTopChurchesByGrowth(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> topGrowth = churchComparisonService.getTopChurchesByGrowth(limit);
        return ResponseEntity.ok(topGrowth);
    }

    @GetMapping("/platform-overview")
    public ResponseEntity<Map<String, Object>> getPlatformOverview() {
        Map<String, Object> overview = churchComparisonService.getPlatformOverview();
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/health-scores")
    public ResponseEntity<Map<Long, Map<String, Object>>> getChurchHealthScores() {
        Map<Long, Map<String, Object>> healthScores = churchComparisonService.getChurchHealthScores();
        return ResponseEntity.ok(healthScores);
    }
}
