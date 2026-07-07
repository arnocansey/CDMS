package com.cdms.repository;

import com.cdms.entity.CashFlowEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CashFlowEntryRepository extends JpaRepository<CashFlowEntry, Long> {
    List<CashFlowEntry> findByEntryDateBetween(LocalDate startDate, LocalDate endDate);
    List<CashFlowEntry> findByEntryTypeAndEntryDateBetween(String entryType, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CashFlowEntry c WHERE c.entryType = :entryType AND c.entryDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByEntryTypeAndEntryDateBetween(@Param("entryType") String entryType, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<CashFlowEntry> findByEntryDate(LocalDate entryDate);
    List<CashFlowEntry> findByChurchId(Long churchId);
}
