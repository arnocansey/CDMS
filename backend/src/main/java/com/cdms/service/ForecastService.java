package com.cdms.service;

import com.cdms.dto.ForecastDto;
import com.cdms.entity.Expense;
import com.cdms.entity.Forecast;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.ForecastRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.TitheRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForecastService {

    private final ForecastRepository forecastRepository;
    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final ExpenseRepository expenseRepository;

    public ForecastService(ForecastRepository forecastRepository, DonationRepository donationRepository,
                           TitheRepository titheRepository, OfferingRepository offeringRepository,
                           ExpenseRepository expenseRepository) {
        this.forecastRepository = forecastRepository;
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.expenseRepository = expenseRepository;
    }

    public List<ForecastDto> getAllForecasts() {
        return forecastRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ForecastDto> generateForecast(String type, int periods) {
        List<ForecastDto> forecasts = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        int windowSize = 3;

        List<BigDecimal> historicalIncome = new ArrayList<>();
        List<BigDecimal> historicalExpenses = new ArrayList<>();

        for (int i = windowSize + periods; i > 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();

            BigDecimal income = donationRepository.sumByDateRange(monthStart, monthEnd)
                    .add(titheRepository.sumByDateRange(monthStart, monthEnd))
                    .add(offeringRepository.sumByDateRange(monthStart, monthEnd));
            BigDecimal expenses = expenseRepository.sumByDateRange(monthStart, monthEnd);

            historicalIncome.add(income);
            historicalExpenses.add(expenses);
        }

        for (int i = 0; i < periods; i++) {
            int forecastIndex = historicalIncome.size() - periods + i;
            List<BigDecimal> incomeWindow = historicalIncome.subList(Math.max(0, forecastIndex - windowSize), forecastIndex);
            List<BigDecimal> expenseWindow = historicalExpenses.subList(Math.max(0, forecastIndex - windowSize), forecastIndex);

            BigDecimal avgIncome = calculateMovingAverage(incomeWindow, windowSize);
            BigDecimal avgExpenses = calculateMovingAverage(expenseWindow, windowSize);
            BigDecimal incomeGrowth = calculateGrowthRate(incomeWindow);
            BigDecimal expenseGrowth = calculateGrowthRate(expenseWindow);

            BigDecimal predictedIncome = avgIncome.multiply(BigDecimal.ONE.add(incomeGrowth));
            BigDecimal predictedExpenses = avgExpenses.multiply(BigDecimal.ONE.add(expenseGrowth));

            BigDecimal incomeConfidence = calculateConfidence(incomeWindow);
            BigDecimal expenseConfidence = calculateConfidence(expenseWindow);
            BigDecimal avgConfidence = incomeConfidence.add(expenseConfidence)
                    .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);

            YearMonth forecastMonth = currentMonth.plusMonths(i + 1);
            LocalDate forecastDate = forecastMonth.atDay(1);

            Forecast forecast = new Forecast();
            forecast.setForecastName(type + " Forecast - " + forecastMonth);
            forecast.setForecastType(type);
            forecast.setForecastDate(forecastDate);
            forecast.setPredictedIncome(predictedIncome.setScale(2, RoundingMode.HALF_UP));
            forecast.setPredictedExpenses(predictedExpenses.setScale(2, RoundingMode.HALF_UP));
            forecast.setPredictedNet(predictedIncome.subtract(predictedExpenses).setScale(2, RoundingMode.HALF_UP));
            forecast.setConfidenceLevel(avgConfidence);
            forecast.setMethodology("Moving Average + Growth Rate");

            Forecast savedForecast = forecastRepository.save(forecast);
            forecasts.add(mapToDto(savedForecast));
        }

        return forecasts;
    }

    public List<ForecastDto> getForecastsByType(String type) {
        return forecastRepository.findByForecastType(type).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ForecastDto updateActuals(Long forecastId, BigDecimal actualIncome, BigDecimal actualExpenses) {
        Forecast forecast = forecastRepository.findById(forecastId)
                .orElseThrow(() -> new ResourceNotFoundException("Forecast", forecastId));
        forecast.setActualIncome(actualIncome);
        forecast.setActualExpenses(actualExpenses);
        Forecast updatedForecast = forecastRepository.save(forecast);
        return mapToDto(updatedForecast);
    }

    private BigDecimal calculateMovingAverage(List<BigDecimal> values, int window) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        int effectiveWindow = Math.min(values.size(), window);
        List<BigDecimal> windowValues = values.subList(values.size() - effectiveWindow, values.size());
        BigDecimal sum = windowValues.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(effectiveWindow), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateGrowthRate(List<BigDecimal> values) {
        if (values.size() < 2) {
            return BigDecimal.ZERO;
        }
        BigDecimal firstHalf = values.subList(0, values.size() / 2).stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal secondHalf = values.subList(values.size() / 2, values.size()).stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int halfSize = values.size() / 2;
        if (halfSize == 0 || firstHalf.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal firstAvg = firstHalf.divide(BigDecimal.valueOf(halfSize), 2, RoundingMode.HALF_UP);
        BigDecimal secondAvg = secondHalf.divide(BigDecimal.valueOf(values.size() - halfSize), 2, RoundingMode.HALF_UP);
        return secondAvg.subtract(firstAvg).divide(firstAvg.abs(), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateConfidence(List<BigDecimal> values) {
        if (values.size() < 2) {
            return new BigDecimal("50.00");
        }
        BigDecimal mean = values.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
        if (mean.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("50.00");
        }
        BigDecimal variance = values.stream()
                .map(v -> v.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));
        BigDecimal cv = stdDev.divide(mean.abs(), 4, RoundingMode.HALF_UP);
        BigDecimal confidence = BigDecimal.valueOf(100).subtract(cv.multiply(BigDecimal.valueOf(100)));
        return confidence.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }

    private ForecastDto mapToDto(Forecast forecast) {
        ForecastDto dto = new ForecastDto();
        dto.setId(forecast.getId());
        dto.setForecastName(forecast.getForecastName());
        dto.setForecastType(forecast.getForecastType());
        dto.setForecastDate(forecast.getForecastDate());
        dto.setPredictedIncome(forecast.getPredictedIncome());
        dto.setPredictedExpenses(forecast.getPredictedExpenses());
        dto.setPredictedNet(forecast.getPredictedNet());
        dto.setConfidenceLevel(forecast.getConfidenceLevel());
        dto.setMethodology(forecast.getMethodology());
        dto.setActualIncome(forecast.getActualIncome());
        dto.setActualExpenses(forecast.getActualExpenses());
        dto.setNotes(forecast.getNotes());
        return dto;
    }
}
