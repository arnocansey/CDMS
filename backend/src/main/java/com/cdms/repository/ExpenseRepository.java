package com.cdms.repository;

import com.cdms.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByChurchId(Long churchId);
    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    List<Expense> findByChurchIdAndExpenseDateBetween(Long churchId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.churchId = :churchId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByChurchIdAndDateRange(@Param("churchId") Long churchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.category = :category AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndDateRange(@Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
