package com.cdms.service;

import com.cdms.dto.DecisionSupportDto;
import com.cdms.entity.Budget;
import com.cdms.entity.CashFlowEntry;
import com.cdms.entity.Expense;
import com.cdms.entity.FinancialGoal;
import com.cdms.entity.Fund;
import com.cdms.repository.BudgetRepository;
import com.cdms.repository.CashFlowEntryRepository;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.FinancialGoalRepository;
import com.cdms.repository.FundRepository;
import com.cdms.repository.FundTransactionRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.PledgeRepository;
import com.cdms.repository.TitheRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DecisionSupportService {

    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final ExpenseRepository expenseRepository;
    private final FundRepository fundRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final BudgetRepository budgetRepository;
    private final PledgeRepository pledgeRepository;
    private final CashFlowEntryRepository cashFlowEntryRepository;
    private final FinancialGoalRepository financialGoalRepository;

    public DecisionSupportService(DonationRepository donationRepository, TitheRepository titheRepository,
                                  OfferingRepository offeringRepository, ExpenseRepository expenseRepository,
                                  FundRepository fundRepository, FundTransactionRepository fundTransactionRepository,
                                  BudgetRepository budgetRepository, PledgeRepository pledgeRepository,
                                  CashFlowEntryRepository cashFlowEntryRepository,
                                  FinancialGoalRepository financialGoalRepository) {
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.expenseRepository = expenseRepository;
        this.fundRepository = fundRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.budgetRepository = budgetRepository;
        this.pledgeRepository = pledgeRepository;
        this.cashFlowEntryRepository = cashFlowEntryRepository;
        this.financialGoalRepository = financialGoalRepository;
    }

    public DecisionSupportDto generateDecisionSupport() {
        DecisionSupportDto dto = new DecisionSupportDto();

        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.minusMonths(11).atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        BigDecimal totalDonations = donationRepository.sumByDateRange(startDate, endDate);
        BigDecimal totalTithes = titheRepository.sumByDateRange(startDate, endDate);
        BigDecimal totalOfferings = offeringRepository.sumByDateRange(startDate, endDate);

        String highestIncomeSource;
        BigDecimal highestIncomeAmount;
        if (totalDonations.compareTo(totalTithes) >= 0 && totalDonations.compareTo(totalOfferings) >= 0) {
            highestIncomeSource = "Donations";
            highestIncomeAmount = totalDonations;
        } else if (totalTithes.compareTo(totalOfferings) >= 0) {
            highestIncomeSource = "Tithes";
            highestIncomeAmount = totalTithes;
        } else {
            highestIncomeSource = "Offerings";
            highestIncomeAmount = totalOfferings;
        }
        dto.setHighestIncomeSource(highestIncomeSource);
        dto.setHighestIncomeAmount(highestIncomeAmount);

        List<Expense> allExpenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        Map<String, BigDecimal> expensesByCategory = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
        String highestExpenseCategory = expensesByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        BigDecimal highestExpenseAmount = expensesByCategory.getOrDefault(highestExpenseCategory, BigDecimal.ZERO);
        dto.setHighestExpenseCategory(highestExpenseCategory);
        dto.setHighestExpenseAmount(highestExpenseAmount);

        List<Fund> funds = fundRepository.findByActiveTrue();
        Fund bestFund = funds.stream()
                .max((a, b) -> a.getCurrentBalance().compareTo(b.getCurrentBalance()))
                .orElse(null);
        dto.setBestPerformingFund(bestFund != null ? bestFund.getName() : "N/A");
        dto.setBestPerformingFundBalance(bestFund != null ? bestFund.getCurrentBalance() : BigDecimal.ZERO);

        List<FinancialGoal> activeGoals = financialGoalRepository.findByStatus("ACTIVE");
        List<String> underfundedProjects = activeGoals.stream()
                .filter(g -> g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(g -> g.getAmountRaised().multiply(BigDecimal.valueOf(100))
                        .divide(g.getTargetAmount(), 2, RoundingMode.HALF_UP)
                        .compareTo(new BigDecimal("50")) < 0)
                .map(g -> g.getName() + " (" + g.getAmountRaised().multiply(BigDecimal.valueOf(100))
                        .divide(g.getTargetAmount(), 2, RoundingMode.HALF_UP) + "% funded)")
                .collect(Collectors.toList());
        dto.setUnderfundedProjects(underfundedProjects);

        List<Budget> budgets = budgetRepository.findAll();
        List<String> budgetRisks = budgets.stream()
                .filter(b -> b.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(b -> b.getSpent().multiply(BigDecimal.valueOf(100))
                        .divide(b.getAmount(), 2, RoundingMode.HALF_UP)
                        .compareTo(new BigDecimal("80")) > 0)
                .map(b -> b.getName() + " (" + b.getSpent().multiply(BigDecimal.valueOf(100))
                        .divide(b.getAmount(), 2, RoundingMode.HALF_UP) + "% spent)")
                .collect(Collectors.toList());
        dto.setBudgetRisks(budgetRisks);

        List<String> cashFlowWarnings = new ArrayList<>();
        YearMonth lastMonth = currentMonth.minusMonths(1);
        LocalDate lastMonthStart = lastMonth.atDay(1);
        LocalDate lastMonthEnd = lastMonth.atEndOfMonth();

        BigDecimal lastMonthIncome = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("INCOME", lastMonthStart, lastMonthEnd);
        BigDecimal lastMonthExpenses = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("EXPENSE", lastMonthStart, lastMonthEnd);
        BigDecimal lastMonthClosing = lastMonthIncome.subtract(lastMonthExpenses);

        if (lastMonthClosing.compareTo(BigDecimal.ZERO) < 0) {
            cashFlowWarnings.add("Last month had a negative closing balance: " + lastMonthClosing);
        }

        YearMonth twoMonthsAgo = currentMonth.minusMonths(2);
        BigDecimal prevMonthIncome = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("INCOME", twoMonthsAgo.atDay(1), twoMonthsAgo.atEndOfMonth());
        BigDecimal prevMonthExpenses = cashFlowEntryRepository.sumByEntryTypeAndEntryDateBetween("EXPENSE", twoMonthsAgo.atDay(1), twoMonthsAgo.atEndOfMonth());
        BigDecimal prevMonthClosing = prevMonthIncome.subtract(prevMonthExpenses);

        if (prevMonthClosing.compareTo(lastMonthClosing) > 0 && lastMonthClosing.compareTo(BigDecimal.ZERO) < 0) {
            cashFlowWarnings.add("Cash flow is declining: from " + prevMonthClosing + " to " + lastMonthClosing);
        }
        dto.setCashFlowWarnings(cashFlowWarnings);

        return dto;
    }
}
