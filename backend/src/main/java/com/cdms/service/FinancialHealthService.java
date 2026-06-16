package com.cdms.service;

import com.cdms.dto.BudgetDto;
import com.cdms.dto.FinancialHealthDto;
import com.cdms.repository.CashFlowEntryRepository;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.FundRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.TitheRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinancialHealthService {

    private final ForecastService forecastService;
    private final BudgetService budgetService;
    private final FundRepository fundRepository;
    private final CashFlowEntryRepository cashFlowEntryRepository;
    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final ExpenseRepository expenseRepository;

    public FinancialHealthService(ForecastService forecastService, BudgetService budgetService,
                                  FundRepository fundRepository, CashFlowEntryRepository cashFlowEntryRepository,
                                  DonationRepository donationRepository, TitheRepository titheRepository,
                                  OfferingRepository offeringRepository, ExpenseRepository expenseRepository) {
        this.forecastService = forecastService;
        this.budgetService = budgetService;
        this.fundRepository = fundRepository;
        this.cashFlowEntryRepository = cashFlowEntryRepository;
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.expenseRepository = expenseRepository;
    }

    public FinancialHealthDto calculateFinancialHealth() {
        YearMonth currentMonth = YearMonth.now();

        BigDecimal recentIncome = getTotalIncome(currentMonth.minusMonths(2).atDay(1), currentMonth.atEndOfMonth());
        BigDecimal previousIncome = getTotalIncome(currentMonth.minusMonths(5).atDay(1), currentMonth.minusMonths(3).atEndOfMonth());
        BigDecimal incomeGrowthRate = calculateGrowthRate(recentIncome, previousIncome);

        BigDecimal recentExpenses = expenseRepository.sumByDateRange(currentMonth.minusMonths(2).atDay(1), currentMonth.atEndOfMonth());
        BigDecimal previousExpenses = expenseRepository.sumByDateRange(currentMonth.minusMonths(5).atDay(1), currentMonth.minusMonths(3).atEndOfMonth());
        BigDecimal expenseControlRate = calculateExpenseControl(recentExpenses, previousExpenses);

        BigDecimal cashFlowStability = calculateCashFlowStability(currentMonth.minusMonths(5).atDay(1), currentMonth.atEndOfMonth());

        BigDecimal budgetEfficiency = calculateBudgetEfficiency();

        BigDecimal incomeScore = incomeGrowthRate.multiply(BigDecimal.valueOf(25)).add(BigDecimal.valueOf(25));
        BigDecimal expenseScore = expenseControlRate.multiply(BigDecimal.valueOf(25));
        BigDecimal cashFlowScore = cashFlowStability.multiply(BigDecimal.valueOf(25));
        BigDecimal budgetScore = budgetEfficiency.multiply(BigDecimal.valueOf(25));

        int score = incomeScore.add(expenseScore).add(cashFlowScore).add(budgetScore)
                .setScale(0, RoundingMode.HALF_UP).intValue();
        score = Math.max(0, Math.min(100, score));

        String status;
        if (score >= 80) {
            status = "Excellent";
        } else if (score >= 60) {
            status = "Good";
        } else if (score >= 40) {
            status = "Fair";
        } else {
            status = "Poor";
        }

        List<String> recommendations = generateRecommendations(incomeGrowthRate, expenseControlRate, cashFlowStability, budgetEfficiency);

        FinancialHealthDto dto = new FinancialHealthDto();
        dto.setScore(score);
        dto.setStatus(status);
        dto.setIncomeGrowthRate(incomeGrowthRate);
        dto.setExpenseControlRate(expenseControlRate);
        dto.setCashFlowStability(cashFlowStability);
        dto.setBudgetEfficiency(budgetEfficiency);
        dto.setRecommendations(recommendations);
        return dto;
    }

    private BigDecimal getTotalIncome(LocalDate start, LocalDate end) {
        return donationRepository.sumByDateRange(start, end)
                .add(titheRepository.sumByDateRange(start, end))
                .add(offeringRepository.sumByDateRange(start, end));
    }

    private BigDecimal calculateGrowthRate(BigDecimal recent, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return recent.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.ONE : BigDecimal.ZERO;
        }
        return recent.subtract(previous).divide(previous.abs(), 4, RoundingMode.HALF_UP)
                .add(BigDecimal.ONE).max(BigDecimal.ZERO);
    }

    private BigDecimal calculateExpenseControl(BigDecimal recent, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return recent.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : BigDecimal.ZERO;
        }
        if (recent.compareTo(previous) <= 0) {
            return BigDecimal.ONE;
        }
        return previous.divide(recent, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCashFlowStability(LocalDate start, LocalDate end) {
        List<BigDecimal> monthlyNetIncomes = new ArrayList<>();
        YearMonth current = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);

        while (!current.isAfter(endMonth)) {
            LocalDate monthStart = current.atDay(1);
            LocalDate monthEnd = current.atEndOfMonth();
            if (monthStart.isBefore(start)) monthStart = start;
            if (monthEnd.isAfter(end)) monthEnd = end;

            BigDecimal income = getTotalIncome(monthStart, monthEnd);
            BigDecimal expenses = expenseRepository.sumByDateRange(monthStart, monthEnd);
            monthlyNetIncomes.add(income.subtract(expenses));
            current = current.plusMonths(1);
        }

        if (monthlyNetIncomes.size() < 2) {
            return new BigDecimal("50.00");
        }

        BigDecimal mean = monthlyNetIncomes.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(monthlyNetIncomes.size()), 4, RoundingMode.HALF_UP);

        if (mean.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("50.00");
        }

        BigDecimal variance = monthlyNetIncomes.stream()
                .map(v -> v.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(monthlyNetIncomes.size()), 4, RoundingMode.HALF_UP);

        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));
        BigDecimal cv = stdDev.divide(mean.abs(), 4, RoundingMode.HALF_UP);
        return BigDecimal.ONE.subtract(cv).max(BigDecimal.ZERO).min(BigDecimal.ONE);
    }

    private BigDecimal calculateBudgetEfficiency() {
        List<BudgetDto> budgets = budgetService.getAllBudgets();
        if (budgets.isEmpty()) {
            return new BigDecimal("50.00");
        }

        BigDecimal totalBudgeted = budgets.stream().map(BudgetDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = budgets.stream().map(BudgetDto::getSpent).reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBudgeted.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("50.00");
        }

        BigDecimal ratio = totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP);
        BigDecimal diff = ratio.subtract(BigDecimal.ONE).abs();
        return BigDecimal.ONE.subtract(diff).max(BigDecimal.ZERO);
    }

    private List<String> generateRecommendations(BigDecimal incomeGrowth, BigDecimal expenseControl,
                                                  BigDecimal cashFlowStability, BigDecimal budgetEfficiency) {
        List<String> recommendations = new ArrayList<>();

        if (incomeGrowth.compareTo(new BigDecimal("0.95")) < 0) {
            recommendations.add("Income is declining. Consider increasing fundraising efforts or diversifying income sources.");
        }
        if (expenseControl.compareTo(new BigDecimal("0.80")) < 0) {
            recommendations.add("Expenses are growing faster than income. Review and reduce discretionary spending.");
        }
        if (cashFlowStability.compareTo(new BigDecimal("0.60")) < 0) {
            recommendations.add("Cash flow is unstable. Build an emergency fund and improve payment collection.");
        }
        if (budgetEfficiency.compareTo(new BigDecimal("0.70")) < 0) {
            recommendations.add("Budget utilization is poor. Review budget allocations and improve spending discipline.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Financial health is strong. Continue current practices.");
        }
        return recommendations;
    }
}
