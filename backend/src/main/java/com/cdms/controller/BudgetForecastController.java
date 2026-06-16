package com.cdms.controller;

import com.cdms.entity.BudgetForecast;
import com.cdms.service.BudgetForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/forecasting")
public class BudgetForecastController {

    private final BudgetForecastService budgetForecastService;

    public BudgetForecastController(BudgetForecastService budgetForecastService) {
        this.budgetForecastService = budgetForecastService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<BudgetForecast> generateForecast(@RequestBody Map<String, String> body) {
        String period = body.get("period");
        String method = body.getOrDefault("method", "MOVING_AVERAGE");
        Long churchId = com.cdms.security.TenantContext.getChurchId();
        BudgetForecast forecast = budgetForecastService.generateForecast(churchId, period, method);
        return ResponseEntity.ok(forecast);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<BudgetForecast>> listForecasts() {
        List<BudgetForecast> forecasts = budgetForecastService.getAllForecasts();
        return ResponseEntity.ok(forecasts);
    }

    @GetMapping("/accuracy")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, BigDecimal>> getForecastAccuracy() {
        Long churchId = com.cdms.security.TenantContext.getChurchId();
        BigDecimal accuracy = budgetForecastService.getForecastAccuracy(churchId);
        return ResponseEntity.ok(Map.of("accuracy", accuracy));
    }

    @GetMapping("/income-projection")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, BigDecimal>> getIncomeProjection(
            @RequestParam(defaultValue = "6") int months) {
        Long churchId = com.cdms.security.TenantContext.getChurchId();
        Map<String, BigDecimal> projection = budgetForecastService.getIncomeProjection(churchId, months);
        return ResponseEntity.ok(projection);
    }

    @GetMapping("/expense-projection")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, BigDecimal>> getExpenseProjection(
            @RequestParam(defaultValue = "6") int months) {
        Long churchId = com.cdms.security.TenantContext.getChurchId();
        Map<String, BigDecimal> projection = budgetForecastService.getExpenseProjection(churchId, months);
        return ResponseEntity.ok(projection);
    }

    @GetMapping("/year-end")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<Map<String, BigDecimal>> getYearEndProjection() {
        Long churchId = com.cdms.security.TenantContext.getChurchId();
        Map<String, BigDecimal> projection = budgetForecastService.getYearEndProjection(churchId);
        return ResponseEntity.ok(projection);
    }
}
