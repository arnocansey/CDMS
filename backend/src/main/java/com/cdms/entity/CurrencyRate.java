package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "currency_rates", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"base_currency", "target_currency", "last_updated"})
})
public class CurrencyRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "base_currency", nullable = false, length = 3)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false, length = 3)
    private String targetCurrency;

    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal rate;

    @Column(name = "last_updated", nullable = false)
    private LocalDate lastUpdated;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lastUpdated == null) {
            lastUpdated = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
    }

    public CurrencyRate() {}

    public CurrencyRate(String baseCurrency, String targetCurrency, BigDecimal rate, LocalDate lastUpdated) {
        this.baseCurrency = baseCurrency;
        this.targetCurrency = targetCurrency;
        this.rate = rate;
        this.lastUpdated = lastUpdated;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBaseCurrency() { return baseCurrency; }
    public void setBaseCurrency(String baseCurrency) { this.baseCurrency = baseCurrency; }
    public String getTargetCurrency() { return targetCurrency; }
    public void setTargetCurrency(String targetCurrency) { this.targetCurrency = targetCurrency; }
    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }
    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
