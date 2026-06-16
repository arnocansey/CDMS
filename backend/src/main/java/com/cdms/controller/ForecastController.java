package com.cdms.controller;

import com.cdms.dto.ForecastDto;
import com.cdms.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/forecasts")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<ForecastDto>> getAllForecasts() {
        List<ForecastDto> forecasts = forecastService.getAllForecasts();
        return ResponseEntity.ok(forecasts);
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<List<ForecastDto>> getForecastsByType(@PathVariable String type) {
        List<ForecastDto> forecasts = forecastService.getForecastsByType(type);
        return ResponseEntity.ok(forecasts);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<ForecastDto>> generateForecast(
            @RequestParam String type,
            @RequestParam(defaultValue = "12") Integer periods) {
        List<ForecastDto> forecasts = forecastService.generateForecast(type, periods);
        return ResponseEntity.ok(forecasts);
    }

    @PutMapping("/{id}/actuals")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ForecastDto> updateActuals(
            @PathVariable Long id,
            @RequestParam BigDecimal actualIncome,
            @RequestParam BigDecimal actualExpenses) {
        ForecastDto forecast = forecastService.updateActuals(id, actualIncome, actualExpenses);
        return ResponseEntity.ok(forecast);
    }
}
