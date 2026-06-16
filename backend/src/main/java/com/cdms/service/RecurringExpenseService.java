package com.cdms.service;

import com.cdms.entity.Expense;
import com.cdms.entity.RecurringExpense;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.RecurringExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;

    public RecurringExpenseService(RecurringExpenseRepository recurringExpenseRepository,
                                   ExpenseRepository expenseRepository) {
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.expenseRepository = expenseRepository;
    }

    public RecurringExpense create(RecurringExpense recurringExpense) {
        return recurringExpenseRepository.save(recurringExpense);
    }

    public List<RecurringExpense> getAll(Long churchId) {
        return recurringExpenseRepository.findByChurchIdAndActive(churchId, true);
    }

    public RecurringExpense cancel(Long id) {
        RecurringExpense recurringExpense = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringExpense", id));
        recurringExpense.setActive(false);
        return recurringExpenseRepository.save(recurringExpense);
    }

    public void processDueExpenses() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> dueExpenses = recurringExpenseRepository
                .findByChurchIdAndNextDueDateBetween(1L, today, today);

        for (RecurringExpense recurringExpense : dueExpenses) {
            Expense expense = new Expense();
            expense.setChurchId(recurringExpense.getChurchId());
            expense.setCategory(recurringExpense.getCategory());
            expense.setAmount(recurringExpense.getAmount());
            expense.setDescription(recurringExpense.getDescription());
            expense.setExpenseDate(today);
            expense.setPaymentMethod(recurringExpense.getPaymentMethod());
            expenseRepository.save(expense);

            recurringExpense.setLastProcessedDate(today);
            recurringExpense.setNextDueDate(calculateNextDueDate(today, recurringExpense.getFrequency()));
            recurringExpenseRepository.save(recurringExpense);
        }
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, String frequency) {
        switch (frequency.toUpperCase()) {
            case "WEEKLY":
                return currentDueDate.plusWeeks(1);
            case "MONTHLY":
                return currentDueDate.plusMonths(1);
            case "QUARTERLY":
                return currentDueDate.plusMonths(3);
            case "ANNUAL":
                return currentDueDate.plusYears(1);
            default:
                return currentDueDate.plusMonths(1);
        }
    }
}
