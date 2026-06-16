package com.cdms.repository;

import com.cdms.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    List<AuditLog> findByChurchIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(Long churchId, String entityType, Long entityId);

    List<AuditLog> findByChurchIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long churchId, LocalDateTime from, LocalDateTime to);

    List<AuditLog> findByChurchIdAndUserIdOrderByCreatedAtDesc(Long churchId, Long userId);

    List<AuditLog> findByChurchIdOrderByCreatedAtDesc(Long churchId);

    @Query("SELECT a.action, COUNT(a) FROM AuditLog a WHERE a.churchId = :churchId AND a.createdAt BETWEEN :from AND :to GROUP BY a.action")
    List<Object[]> countByChurchIdAndActionBetween(@Param("churchId") Long churchId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
