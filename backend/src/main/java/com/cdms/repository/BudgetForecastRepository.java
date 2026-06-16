package com.cdms.repository;

import com.cdms.entity.BudgetForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetForecastRepository extends JpaRepository<BudgetForecast, Long> {
    List<BudgetForecast> findByChurchId(Long churchId);
    List<BudgetForecast> findByChurchIdAndPeriod(Long churchId, String period);
}
