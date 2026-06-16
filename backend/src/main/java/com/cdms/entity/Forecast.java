package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
public class Forecast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "forecast_name", nullable = false)
    private String forecastName;

    @Column(name = "forecast_type", nullable = false)
    private String forecastType;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "predicted_income", precision = 12, scale = 2)
    private BigDecimal predictedIncome;

    @Column(name = "predicted_expenses", precision = 12, scale = 2)
    private BigDecimal predictedExpenses;

    @Column(name = "predicted_net", precision = 12, scale = 2)
    private BigDecimal predictedNet;

    @Column(name = "confidence_level", precision = 5, scale = 2)
    private BigDecimal confidenceLevel;

    private String methodology;

    @Column(name = "actual_income", precision = 12, scale = 2)
    private BigDecimal actualIncome;

    @Column(name = "actual_expenses", precision = 12, scale = 2)
    private BigDecimal actualExpenses;

    private String notes;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Forecast() {}

    public Forecast(String forecastName, String forecastType, LocalDate forecastDate) {
        this.forecastName = forecastName;
        this.forecastType = forecastType;
        this.forecastDate = forecastDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getForecastName() { return forecastName; }
    public void setForecastName(String forecastName) { this.forecastName = forecastName; }
    public String getForecastType() { return forecastType; }
    public void setForecastType(String forecastType) { this.forecastType = forecastType; }
    public LocalDate getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDate forecastDate) { this.forecastDate = forecastDate; }
    public BigDecimal getPredictedIncome() { return predictedIncome; }
    public void setPredictedIncome(BigDecimal predictedIncome) { this.predictedIncome = predictedIncome; }
    public BigDecimal getPredictedExpenses() { return predictedExpenses; }
    public void setPredictedExpenses(BigDecimal predictedExpenses) { this.predictedExpenses = predictedExpenses; }
    public BigDecimal getPredictedNet() { return predictedNet; }
    public void setPredictedNet(BigDecimal predictedNet) { this.predictedNet = predictedNet; }
    public BigDecimal getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(BigDecimal confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public String getMethodology() { return methodology; }
    public void setMethodology(String methodology) { this.methodology = methodology; }
    public BigDecimal getActualIncome() { return actualIncome; }
    public void setActualIncome(BigDecimal actualIncome) { this.actualIncome = actualIncome; }
    public BigDecimal getActualExpenses() { return actualExpenses; }
    public void setActualExpenses(BigDecimal actualExpenses) { this.actualExpenses = actualExpenses; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
