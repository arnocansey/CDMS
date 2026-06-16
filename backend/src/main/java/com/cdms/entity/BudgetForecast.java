package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_forecasts")
public class BudgetForecast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "forecast_name", nullable = false)
    private String forecastName;

    @Column(nullable = false)
    private String period;

    @Column(name = "forecasted_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal forecastedIncome;

    @Column(name = "forecasted_expenses", nullable = false, precision = 12, scale = 2)
    private BigDecimal forecastedExpenses;

    @Column(name = "actual_income", precision = 12, scale = 2)
    private BigDecimal actualIncome;

    @Column(name = "actual_expenses", precision = 12, scale = 2)
    private BigDecimal actualExpenses;

    @Column(name = "variance_income", precision = 12, scale = 2)
    private BigDecimal varianceIncome;

    @Column(name = "variance_expenses", precision = 12, scale = 2)
    private BigDecimal varianceExpenses;

    @Column(nullable = false)
    private String method;

    @Column(precision = 5, scale = 2)
    private BigDecimal confidence;

    private String notes;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public BudgetForecast() {}

    public BudgetForecast(String forecastName, String period, String method) {
        this.forecastName = forecastName;
        this.period = period;
        this.method = method;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getForecastName() { return forecastName; }
    public void setForecastName(String forecastName) { this.forecastName = forecastName; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public BigDecimal getForecastedIncome() { return forecastedIncome; }
    public void setForecastedIncome(BigDecimal forecastedIncome) { this.forecastedIncome = forecastedIncome; }
    public BigDecimal getForecastedExpenses() { return forecastedExpenses; }
    public void setForecastedExpenses(BigDecimal forecastedExpenses) { this.forecastedExpenses = forecastedExpenses; }
    public BigDecimal getActualIncome() { return actualIncome; }
    public void setActualIncome(BigDecimal actualIncome) { this.actualIncome = actualIncome; }
    public BigDecimal getActualExpenses() { return actualExpenses; }
    public void setActualExpenses(BigDecimal actualExpenses) { this.actualExpenses = actualExpenses; }
    public BigDecimal getVarianceIncome() { return varianceIncome; }
    public void setVarianceIncome(BigDecimal varianceIncome) { this.varianceIncome = varianceIncome; }
    public BigDecimal getVarianceExpenses() { return varianceExpenses; }
    public void setVarianceExpenses(BigDecimal varianceExpenses) { this.varianceExpenses = varianceExpenses; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
