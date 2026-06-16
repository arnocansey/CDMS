package com.cdms.service;

import com.cdms.entity.CurrencyRate;
import com.cdms.repository.CurrencyRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CurrencyService {

    private static final Logger logger = LoggerFactory.getLogger(CurrencyService.class);
    private static final String API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
    private static final List<String> SUPPORTED_CURRENCIES = Arrays.asList(
            "USD", "EUR", "GBP", "CAD", "AUD", "GHS", "NGN", "ZAR", "KES", "JPY", "INR", "CNY"
    );

    private final CurrencyRateRepository currencyRateRepository;
    private final RestTemplate restTemplate;

    public CurrencyService(CurrencyRateRepository currencyRateRepository, RestTemplate restTemplate) {
        this.currencyRateRepository = currencyRateRepository;
        this.restTemplate = restTemplate;
    }

    public BigDecimal getExchangeRate(String from, String to) {
        if (from.equalsIgnoreCase(to)) {
            return BigDecimal.ONE;
        }

        String base = from.toUpperCase();
        String target = to.toUpperCase();

        Optional<CurrencyRate> existing = currencyRateRepository.findByBaseCurrencyAndTargetCurrency(base, target);
        if (existing.isPresent()) {
            CurrencyRate rate = existing.get();
            if (!rate.getLastUpdated().isBefore(LocalDate.now())) {
                return rate.getRate();
            }
        }

        refreshRates();
        Optional<CurrencyRate> refreshed = currencyRateRepository.findByBaseCurrencyAndTargetCurrency(base, target);
        return refreshed.map(CurrencyRate::getRate).orElseThrow(() ->
                new RuntimeException("Exchange rate not found for " + base + " to " + target));
    }

    public BigDecimal convertAmount(BigDecimal amount, String from, String to) {
        BigDecimal rate = getExchangeRate(from, to);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    @Scheduled(fixedRate = 86400000)
    public void refreshRates() {
        try {
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            if (response == null || !response.containsKey("rates")) {
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            LocalDate today = LocalDate.now();

            for (String base : SUPPORTED_CURRENCIES) {
                Object baseRateObj = rates.get(base);
                if (baseRateObj == null) continue;
                BigDecimal baseRate = new BigDecimal(baseRateObj.toString());

                for (String target : SUPPORTED_CURRENCIES) {
                    if (base.equals(target)) continue;
                    Object targetRateObj = rates.get(target);
                    if (targetRateObj == null) continue;
                    BigDecimal targetRate = new BigDecimal(targetRateObj.toString());

                    BigDecimal convertedRate = targetRate.divide(baseRate, 6, RoundingMode.HALF_UP);

                    Optional<CurrencyRate> existing = currencyRateRepository
                            .findByBaseCurrencyAndTargetCurrency(base, target);

                    if (existing.isPresent()) {
                        CurrencyRate rateEntity = existing.get();
                        if (rateEntity.getLastUpdated().isBefore(today)) {
                            rateEntity.setRate(convertedRate);
                            rateEntity.setLastUpdated(today);
                            currencyRateRepository.save(rateEntity);
                        }
                    } else {
                        CurrencyRate rateEntity = new CurrencyRate(base, target, convertedRate, today);
                        currencyRateRepository.save(rateEntity);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to refresh exchange rates: {}", e.getMessage());
        }
    }

    public List<String> getCurrencies() {
        return SUPPORTED_CURRENCIES;
    }

    public Map<String, BigDecimal> getRatesForBase(String base) {
        String baseUpper = base.toUpperCase();
        List<CurrencyRate> rates = currencyRateRepository.findByBaseCurrency(baseUpper);
        Map<String, BigDecimal> result = new HashMap<>();
        for (CurrencyRate rate : rates) {
            result.put(rate.getTargetCurrency(), rate.getRate());
        }
        return result;
    }
}
