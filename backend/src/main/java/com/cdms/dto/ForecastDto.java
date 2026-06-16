package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ForecastDto {
    private Long id;

    @NotBlank(message = "Forecast name is required")
    private String forecastName;

    @NotBlank(message = "Forecast type is required")
    private String forecastType;

    private LocalDate forecastDate;
    private BigDecimal predictedIncome;
    private BigDecimal predictedExpenses;
    private BigDecimal predictedNet;
    private BigDecimal confidenceLevel;
    private String methodology;
    private BigDecimal actualIncome;
    private BigDecimal actualExpenses;
    private String notes;

    public ForecastDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
}
