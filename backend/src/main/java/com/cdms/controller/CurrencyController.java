package com.cdms.controller;

import com.cdms.service.CurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currencies")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getCurrencies() {
        return ResponseEntity.ok(currencyService.getCurrencies());
    }

    @GetMapping("/rates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, BigDecimal>> getRates(@RequestParam String base) {
        return ResponseEntity.ok(currencyService.getRatesForBase(base));
    }

    @GetMapping("/convert")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam BigDecimal amount,
            @RequestParam String from,
            @RequestParam String to) {
        BigDecimal converted = currencyService.convertAmount(amount, from, to);
        BigDecimal rate = currencyService.getExchangeRate(from, to);

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("amount", amount);
        result.put("from", from.toUpperCase());
        result.put("to", to.toUpperCase());
        result.put("rate", rate);
        result.put("convertedAmount", converted);

        return ResponseEntity.ok(result);
    }
}
