package com.cdms.repository;

import com.cdms.entity.Tithe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TitheRepository extends JpaRepository<Tithe, Long> {
    List<Tithe> findByChurchId(Long churchId);
    List<Tithe> findByTitheDateBetween(LocalDate startDate, LocalDate endDate);
    List<Tithe> findByChurchIdAndTitheDateBetween(Long churchId, LocalDate startDate, LocalDate endDate);
    Page<Tithe> findByChurchIdAndTitheDateBetween(Long churchId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Tithe t WHERE t.titheDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Tithe t WHERE t.churchId = :churchId AND t.titheDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByChurchIdAndDateRange(@Param("churchId") Long churchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Tithe> findByMemberId(Long memberId);
}
