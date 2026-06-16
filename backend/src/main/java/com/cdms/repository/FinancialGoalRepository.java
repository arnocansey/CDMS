package com.cdms.repository;

import com.cdms.entity.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {
    List<FinancialGoal> findByChurchId(Long churchId);
    List<FinancialGoal> findByStatus(String status);
    List<FinancialGoal> findByChurchIdAndStatus(Long churchId, String status);
    List<FinancialGoal> findByCategory(String category);
    List<FinancialGoal> findByStatusAndCategory(String status, String category);
}
