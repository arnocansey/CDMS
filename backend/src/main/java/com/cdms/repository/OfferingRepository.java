package com.cdms.repository;

import com.cdms.entity.Offering;
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
public interface OfferingRepository extends JpaRepository<Offering, Long> {
    List<Offering> findByChurchId(Long churchId);
    List<Offering> findByServiceDateBetween(LocalDate startDate, LocalDate endDate);
    List<Offering> findByChurchIdAndServiceDateBetween(Long churchId, LocalDate startDate, LocalDate endDate);
    Page<Offering> findByChurchIdAndServiceDateBetween(Long churchId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Offering o WHERE o.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Offering o WHERE o.churchId = :churchId AND o.serviceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByChurchIdAndDateRange(@Param("churchId") Long churchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
