package com.cdms.controller;

import com.cdms.entity.AuditLog;
import com.cdms.security.TenantContext;
import com.cdms.service.AuditLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        List<AuditLog> logs;
        if (from != null && to != null) {
            logs = auditLogService.getAuditLogsByDateRange(churchId, from, to);
        } else {
            logs = auditLogService.getAuditLogs(churchId);
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<List<AuditLog>> getEntityAuditTrail(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        Long churchId = TenantContext.getChurchId();
        List<AuditLog> trail = auditLogService.getAuditTrail(churchId, entityType, entityId);
        return ResponseEntity.ok(trail);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<Map<String, Long>> getAuditSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        Map<String, Long> summary = auditLogService.getAuditSummary(churchId, from, to);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<List<AuditLog>> getUserActivity(@PathVariable Long userId) {
        Long churchId = TenantContext.getChurchId();
        List<AuditLog> activity = auditLogService.getUserActivity(churchId, userId);
        return ResponseEntity.ok(activity);
    }
}
