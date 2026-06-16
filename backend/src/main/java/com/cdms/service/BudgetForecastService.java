package com.cdms.service;

import com.cdms.entity.BudgetForecast;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.BudgetForecastRepository;
import com.cdms.repository.BudgetRepository;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.TitheRepository;
import com.cdms.security.TenantContext;
import com.cdms.entity.User;
import com.cdms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetForecastService {

    private final BudgetForecastRepository budgetForecastRepository;
    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetForecastService(BudgetForecastRepository budgetForecastRepository,
                                 DonationRepository donationRepository,
                                 TitheRepository titheRepository,
                                 OfferingRepository offeringRepository,
                                 ExpenseRepository expenseRepository,
                                 BudgetRepository budgetRepository,
                                 UserRepository userRepository) {
        this.budgetForecastRepository = budgetForecastRepository;
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public BudgetForecast generateForecast(Long churchId, String period, String method) {
        List<BigDecimal> historicalIncome = new ArrayList<>();
        List<BigDecimal> historicalExpenses = new ArrayList<>();

        for (int i = 6; i > 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();

            BigDecimal income = donationRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd)
                    .add(titheRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd))
                    .add(offeringRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd));
            BigDecimal expenses = expenseRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd);

            historicalIncome.add(income);
            historicalExpenses.add(expenses);
        }

        BigDecimal forecastedIncome;
        BigDecimal forecastedExpenses;
        BigDecimal confidence;

        switch (method.toUpperCase()) {
            case "LINEAR":
                forecastedIncome = linearRegression(historicalIncome);
                forecastedExpenses = linearRegression(historicalExpenses);
                confidence = calculateConfidence(historicalIncome).add(calculateConfidence(historicalExpenses))
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                break;
            case "WEIGHTED":
                forecastedIncome = weightedAverage(historicalIncome);
                forecastedExpenses = weightedAverage(historicalExpenses);
                confidence = calculateConfidence(historicalIncome).add(calculateConfidence(historicalExpenses))
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                break;
            case "MOVING_AVERAGE":
            default:
                forecastedIncome = movingAverage(historicalIncome);
                forecastedExpenses = movingAverage(historicalExpenses);
                confidence = calculateConfidence(historicalIncome).add(calculateConfidence(historicalExpenses))
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                break;
        }

        BudgetForecast forecast = new BudgetForecast();
        forecast.setChurchId(churchId);
        forecast.setForecastName(method + " Forecast - " + period);
        forecast.setPeriod(period);
        forecast.setForecastedIncome(forecastedIncome.setScale(2, RoundingMode.HALF_UP));
        forecast.setForecastedExpenses(forecastedExpenses.setScale(2, RoundingMode.HALF_UP));
        forecast.setMethod(method.toUpperCase());
        forecast.setConfidence(confidence);
        forecast.setCreatedBy(getCurrentUserId() != null ? String.valueOf(getCurrentUserId()) : "SYSTEM");

        return budgetForecastRepository.save(forecast);
    }

    public BudgetForecast calculateVariance(Long forecastId) {
        BudgetForecast forecast = budgetForecastRepository.findById(forecastId)
                .orElseThrow(() -> new ResourceNotFoundException("BudgetForecast", forecastId));

        YearMonth periodMonth = parsePeriodToYearMonth(forecast.getPeriod());
        LocalDate periodStart = periodMonth.atDay(1);
        LocalDate periodEnd = periodMonth.atEndOfMonth();

        BigDecimal actualIncome = donationRepository.sumByChurchIdAndDateRange(forecast.getChurchId(), periodStart, periodEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(forecast.getChurchId(), periodStart, periodEnd))
                .add(offeringRepository.sumByChurchIdAndDateRange(forecast.getChurchId(), periodStart, periodEnd));
        BigDecimal actualExpenses = expenseRepository.sumByChurchIdAndDateRange(forecast.getChurchId(), periodStart, periodEnd);

        forecast.setActualIncome(actualIncome);
        forecast.setActualExpenses(actualExpenses);
        forecast.setVarianceIncome(forecast.getForecastedIncome().subtract(actualIncome));
        forecast.setVarianceExpenses(forecast.getForecastedExpenses().subtract(actualExpenses));

        return budgetForecastRepository.save(forecast);
    }

    public BigDecimal getForecastAccuracy(Long churchId) {
        List<BudgetForecast> forecasts = budgetForecastRepository.findByChurchId(churchId);
        List<BudgetForecast> completedForecasts = forecasts.stream()
                .filter(f -> f.getActualIncome() != null && f.getActualExpenses() != null)
                .toList();

        if (completedForecasts.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalApe = BigDecimal.ZERO;
        int count = 0;

        for (BudgetForecast f : completedForecasts) {
            if (f.getForecastedIncome().compareTo(BigDecimal.ZERO) != 0) {
                BigDecimal incomeApe = f.getVarianceIncome().abs()
                        .divide(f.getForecastedIncome().abs(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                totalApe = totalApe.add(incomeApe);
                count++;
            }
            if (f.getForecastedExpenses().compareTo(BigDecimal.ZERO) != 0) {
                BigDecimal expenseApe = f.getVarianceExpenses().abs()
                        .divide(f.getForecastedExpenses().abs(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                totalApe = totalApe.add(expenseApe);
                count++;
            }
        }

        if (count == 0) {
            return BigDecimal.ZERO;
        }

        return totalApe.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    public Map<String, BigDecimal> getIncomeProjection(Long churchId, int monthsAhead) {
        List<BigDecimal> historicalIncome = getLast6MonthsIncome(churchId);

        Map<String, BigDecimal> projection = new LinkedHashMap<>();
        BigDecimal slope = calculateSlope(historicalIncome);
        BigDecimal intercept = calculateIntercept(historicalIncome, slope);
        BigDecimal lastValue = historicalIncome.get(historicalIncome.size() - 1);

        for (int i = 1; i <= monthsAhead; i++) {
            BigDecimal predicted = intercept.add(slope.multiply(BigDecimal.valueOf(historicalIncome.size() + i - 1)));
            if (predicted.compareTo(BigDecimal.ZERO) < 0) {
                predicted = lastValue;
            }
            YearMonth projectedMonth = YearMonth.now().plusMonths(i);
            projection.put(projectedMonth.toString(), predicted.setScale(2, RoundingMode.HALF_UP));
        }

        return projection;
    }

    public Map<String, BigDecimal> getExpenseProjection(Long churchId, int monthsAhead) {
        List<BigDecimal> historicalExpenses = getLast6MonthsExpenses(churchId);

        Map<String, BigDecimal> projection = new LinkedHashMap<>();
        BigDecimal slope = calculateSlope(historicalExpenses);
        BigDecimal intercept = calculateIntercept(historicalExpenses, slope);
        BigDecimal lastValue = historicalExpenses.get(historicalExpenses.size() - 1);

        for (int i = 1; i <= monthsAhead; i++) {
            BigDecimal predicted = intercept.add(slope.multiply(BigDecimal.valueOf(historicalExpenses.size() + i - 1)));
            if (predicted.compareTo(BigDecimal.ZERO) < 0) {
                predicted = lastValue;
            }
            YearMonth projectedMonth = YearMonth.now().plusMonths(i);
            projection.put(projectedMonth.toString(), predicted.setScale(2, RoundingMode.HALF_UP));
        }

        return projection;
    }

    public Map<String, BigDecimal> getYearEndProjection(Long churchId) {
        List<BigDecimal> historicalIncome = getLast6MonthsIncome(churchId);
        List<BigDecimal> historicalExpenses = getLast6MonthsExpenses(churchId);

        BigDecimal incomeSlope = calculateSlope(historicalIncome);
        BigDecimal incomeIntercept = calculateIntercept(historicalIncome, incomeSlope);
        BigDecimal expenseSlope = calculateSlope(historicalExpenses);
        BigDecimal expenseIntercept = calculateIntercept(historicalExpenses, expenseSlope);

        int monthsRemaining = 12 - YearMonth.now().getMonthValue();
        BigDecimal totalProjectedIncome = BigDecimal.ZERO;
        BigDecimal totalProjectedExpenses = BigDecimal.ZERO;

        for (int i = 1; i <= monthsRemaining; i++) {
            BigDecimal monthIncome = incomeIntercept.add(incomeSlope.multiply(BigDecimal.valueOf(historicalIncome.size() + i - 1)));
            if (monthIncome.compareTo(BigDecimal.ZERO) < 0) monthIncome = BigDecimal.ZERO;
            totalProjectedIncome = totalProjectedIncome.add(monthIncome);

            BigDecimal monthExpense = expenseIntercept.add(expenseSlope.multiply(BigDecimal.valueOf(historicalExpenses.size() + i - 1)));
            if (monthExpense.compareTo(BigDecimal.ZERO) < 0) monthExpense = BigDecimal.ZERO;
            totalProjectedExpenses = totalProjectedExpenses.add(monthExpense);
        }

        YearMonth now = YearMonth.now();
        BigDecimal ytdIncome = donationRepository.sumByChurchIdAndDateRange(churchId, now.atDay(1), now.atEndOfMonth())
                .add(titheRepository.sumByChurchIdAndDateRange(churchId, now.atDay(1), now.atEndOfMonth()))
                .add(offeringRepository.sumByChurchIdAndDateRange(churchId, now.atDay(1), now.atEndOfMonth()));
        BigDecimal ytdExpenses = expenseRepository.sumByChurchIdAndDateRange(churchId, now.atDay(1), now.atEndOfMonth());

        BigDecimal yearEndBalance = ytdIncome.add(totalProjectedIncome).subtract(ytdExpenses.add(totalProjectedExpenses));

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("projectedIncome", totalProjectedIncome.setScale(2, RoundingMode.HALF_UP));
        result.put("projectedExpenses", totalProjectedExpenses.setScale(2, RoundingMode.HALF_UP));
        result.put("projectedBalance", yearEndBalance.setScale(2, RoundingMode.HALF_UP));
        result.put("ytdIncome", ytdIncome.setScale(2, RoundingMode.HALF_UP));
        result.put("ytdExpenses", ytdExpenses.setScale(2, RoundingMode.HALF_UP));

        return result;
    }

    public List<BudgetForecast> getAllForecasts() {
        Long churchId = TenantContext.getChurchId();
        return budgetForecastRepository.findByChurchId(churchId);
    }

    private List<BigDecimal> getLast6MonthsIncome(Long churchId) {
        List<BigDecimal> income = new ArrayList<>();
        for (int i = 6; i > 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();
            BigDecimal monthIncome = donationRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd)
                    .add(titheRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd))
                    .add(offeringRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd));
            income.add(monthIncome);
        }
        return income;
    }

    private List<BigDecimal> getLast6MonthsExpenses(Long churchId) {
        List<BigDecimal> expenses = new ArrayList<>();
        for (int i = 6; i > 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();
            BigDecimal monthExpense = expenseRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd);
            expenses.add(monthExpense);
        }
        return expenses;
    }

    private BigDecimal linearRegression(List<BigDecimal> values) {
        int n = values.size();
        if (n == 0) return BigDecimal.ZERO;

        BigDecimal slope = calculateSlope(values);
        BigDecimal intercept = calculateIntercept(values, slope);

        return intercept.add(slope.multiply(BigDecimal.valueOf(n)));
    }

    private BigDecimal calculateSlope(List<BigDecimal> values) {
        int n = values.size();
        if (n < 2) return BigDecimal.ZERO;

        BigDecimal sumX = BigDecimal.ZERO;
        BigDecimal sumY = BigDecimal.ZERO;
        BigDecimal sumXY = BigDecimal.ZERO;
        BigDecimal sumX2 = BigDecimal.ZERO;

        for (int i = 0; i < n; i++) {
            BigDecimal x = BigDecimal.valueOf(i);
            BigDecimal y = values.get(i);
            sumX = sumX.add(x);
            sumY = sumY.add(y);
            sumXY = sumXY.add(x.multiply(y));
            sumX2 = sumX2.add(x.multiply(x));
        }

        BigDecimal denominator = BigDecimal.valueOf(n).multiply(sumX2).subtract(sumX.multiply(sumX));
        if (denominator.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;

        BigDecimal numerator = BigDecimal.valueOf(n).multiply(sumXY).subtract(sumX.multiply(sumY));
        return numerator.divide(denominator, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateIntercept(List<BigDecimal> values, BigDecimal slope) {
        int n = values.size();
        if (n == 0) return BigDecimal.ZERO;

        BigDecimal sumY = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sumX = BigDecimal.ZERO;
        for (int i = 0; i < n; i++) {
            sumX = sumX.add(BigDecimal.valueOf(i));
        }

        BigDecimal avgY = sumY.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        BigDecimal avgX = sumX.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        return avgY.subtract(slope.multiply(avgX));
    }

    private BigDecimal movingAverage(List<BigDecimal> values) {
        if (values.isEmpty()) return BigDecimal.ZERO;

        int window = Math.min(3, values.size());
        BigDecimal weightedSum = BigDecimal.ZERO;
        BigDecimal weightSum = BigDecimal.ZERO;

        for (int i = 0; i < window; i++) {
            int weight = window - i + 1;
            weightedSum = weightedSum.add(values.get(values.size() - window + i).multiply(BigDecimal.valueOf(weight)));
            weightSum = weightSum.add(BigDecimal.valueOf(weight));
        }

        return weightedSum.divide(weightSum, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal weightedAverage(List<BigDecimal> values) {
        if (values.isEmpty()) return BigDecimal.ZERO;

        BigDecimal weightedSum = BigDecimal.ZERO;
        BigDecimal weightSum = BigDecimal.ZERO;

        for (int i = 0; i < values.size(); i++) {
            int weight = i + 1;
            weightedSum = weightedSum.add(values.get(i).multiply(BigDecimal.valueOf(weight)));
            weightSum = weightSum.add(BigDecimal.valueOf(weight));
        }

        return weightedSum.divide(weightSum, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateConfidence(List<BigDecimal> values) {
        if (values.size() < 2) return new BigDecimal("50.00");

        BigDecimal mean = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
        if (mean.compareTo(BigDecimal.ZERO) == 0) return new BigDecimal("50.00");

        BigDecimal variance = values.stream()
                .map(v -> v.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));
        BigDecimal cv = stdDev.divide(mean.abs(), 4, RoundingMode.HALF_UP);
        BigDecimal confidence = BigDecimal.valueOf(100).subtract(cv.multiply(BigDecimal.valueOf(100)));
        return confidence.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }

    private YearMonth parsePeriodToYearMonth(String period) {
        String cleaned = period.trim();
        if (cleaned.matches("\\d{4}-Q[1-4]")) {
            int year = Integer.parseInt(cleaned.substring(0, 4));
            int quarter = Integer.parseInt(cleaned.substring(6));
            int month = (quarter - 1) * 3 + 1;
            return YearMonth.of(year, month);
        }
        if (cleaned.matches("\\d{4}-\\d{2}")) {
            return YearMonth.parse(cleaned, DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return YearMonth.now();
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String) {
            String email = (String) auth.getPrincipal();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
