package com.cdms.repository;

import com.cdms.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByChurchId(Long churchId);
    List<Budget> findByPeriod(String period);
    List<Budget> findByCategory(String category);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Budget b WHERE b.period = :period")
    BigDecimal sumAmountByPeriod(@Param("period") String period);

    @Query("SELECT COALESCE(SUM(b.spent), 0) FROM Budget b WHERE b.period = :period")
    BigDecimal sumSpentByPeriod(@Param("period") String period);
}
