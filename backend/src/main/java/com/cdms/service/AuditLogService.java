package com.cdms.service;

import com.cdms.entity.AuditLog;
import com.cdms.repository.AuditLogRepository;
import com.cdms.security.TenantContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public void log(Long userId, String action, String entityType, Long entityId) {
        AuditLog auditLog = new AuditLog(userId, action, entityType, entityId);
        auditLog.setChurchId(TenantContext.getChurchId());
        auditLog.setIpAddress(getClientIpAddress());
        auditLogRepository.save(auditLog);
    }

    public void log(Long userId, String action, String entityType, Long entityId, String oldValues, String newValues) {
        AuditLog auditLog = new AuditLog(userId, action, entityType, entityId);
        auditLog.setChurchId(TenantContext.getChurchId());
        auditLog.setOldValues(oldValues);
        auditLog.setNewValues(newValues);
        auditLog.setIpAddress(getClientIpAddress());
        auditLogRepository.save(auditLog);
    }

    public void logWithObject(Long userId, String action, String entityType, Long entityId, Object oldObj, Object newObj) {
        try {
            String oldValues = oldObj != null ? objectMapper.writeValueAsString(oldObj) : null;
            String newValues = newObj != null ? objectMapper.writeValueAsString(newObj) : null;
            log(userId, action, entityType, entityId, oldValues, newValues);
        } catch (Exception e) {
            log(userId, action, entityType, entityId);
        }
    }

    public void logAction(Long churchId, Long userId, String action, String entityType, Long entityId,
                          String oldValues, String newValues, String ipAddress) {
        AuditLog auditLog = new AuditLog(userId, action, entityType, entityId);
        auditLog.setChurchId(churchId);
        auditLog.setOldValues(oldValues);
        auditLog.setNewValues(newValues);
        auditLog.setIpAddress(ipAddress != null ? ipAddress : getClientIpAddress());
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAuditTrail(Long churchId, String entityType, Long entityId) {
        return auditLogRepository.findByChurchIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(churchId, entityType, entityId);
    }

    public Map<String, Long> getAuditSummary(Long churchId, LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = LocalDateTime.of(from, LocalTime.MIN);
        LocalDateTime toDateTime = LocalDateTime.of(to, LocalTime.MAX);
        List<Object[]> results = auditLogRepository.countByChurchIdAndActionBetween(churchId, fromDateTime, toDateTime);
        Map<String, Long> summary = new HashMap<>();
        for (Object[] row : results) {
            summary.put((String) row[0], (Long) row[1]);
        }
        return summary;
    }

    public List<AuditLog> getUserActivity(Long churchId, Long userId) {
        return auditLogRepository.findByChurchIdAndUserIdOrderByCreatedAtDesc(churchId, userId);
    }

    public List<AuditLog> getAuditLogs(Long churchId) {
        return auditLogRepository.findByChurchIdOrderByCreatedAtDesc(churchId);
    }

    public List<AuditLog> getAuditLogsByDateRange(Long churchId, LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = LocalDateTime.of(from, LocalTime.MIN);
        LocalDateTime toDateTime = LocalDateTime.of(to, LocalTime.MAX);
        return auditLogRepository.findByChurchIdAndCreatedAtBetweenOrderByCreatedAtDesc(churchId, fromDateTime, toDateTime);
    }

    public Page<AuditLog> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<AuditLog> getAuditLogsByEntityType(String entityType, Pageable pageable) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
    }

    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return attributes.getRequest().getRemoteAddr();
            }
        } catch (Exception e) {
            // ignore
        }
        return "unknown";
    }
}
