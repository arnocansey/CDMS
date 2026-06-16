package com.cdms.controller;

import com.cdms.entity.Visitor;
import com.cdms.security.TenantContext;
import com.cdms.service.VisitorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<Visitor> recordVisit(@RequestBody Visitor visitor) {
        Long churchId = TenantContext.getChurchId();
        Visitor saved = visitorService.recordVisit(visitor, churchId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<Visitor>> getVisitors(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        List<Visitor> visitors = visitorService.getVisitors(churchId, from, to);
        return ResponseEntity.ok(visitors);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<Map<String, Object>> getVisitorStats() {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> stats = visitorService.getVisitorStats(churchId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<Map<String, Object>>> getVisitorTrend(
            @RequestParam(defaultValue = "6") int months) {
        Long churchId = TenantContext.getChurchId();
        List<Map<String, Object>> trend = visitorService.getVisitorTrend(churchId, months);
        return ResponseEntity.ok(trend);
    }

    @PutMapping("/{id}/follow-up")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<Visitor> updateFollowUp(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        Visitor updated = visitorService.updateFollowUp(id, status, notes);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/follow-up")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<Visitor>> getFollowUpList() {
        Long churchId = TenantContext.getChurchId();
        List<Visitor> visitors = visitorService.getFollowUpList(churchId);
        return ResponseEntity.ok(visitors);
    }
}
