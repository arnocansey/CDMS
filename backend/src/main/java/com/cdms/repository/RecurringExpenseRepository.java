package com.cdms.repository;

import com.cdms.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByChurchIdAndActive(Long churchId, boolean active);
    List<RecurringExpense> findByChurchIdAndNextDueDateBetween(Long churchId, LocalDate start, LocalDate end);
    List<RecurringExpense> findByChurchId(Long churchId);
}
