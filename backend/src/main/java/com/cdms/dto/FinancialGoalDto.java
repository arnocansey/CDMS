package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialGoalDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Target amount is required")
    private BigDecimal targetAmount;

    private BigDecimal amountRaised;
    private BigDecimal remainingBalance;
    private BigDecimal percentageCompletion;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private String status;
    private String category;
    private String createdBy;

    public FinancialGoalDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public BigDecimal getAmountRaised() { return amountRaised; }
    public void setAmountRaised(BigDecimal amountRaised) { this.amountRaised = amountRaised; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
    public BigDecimal getPercentageCompletion() { return percentageCompletion; }
    public void setPercentageCompletion(BigDecimal percentageCompletion) { this.percentageCompletion = percentageCompletion; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
