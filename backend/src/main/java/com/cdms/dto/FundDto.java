package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FundDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Fund type is required")
    private String fundType;

    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private BigDecimal targetAmount;
    private Boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
    private Integer transactionsCount;

    public FundDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFundType() { return fundType; }
    public void setFundType(String fundType) { this.fundType = fundType; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getTransactionsCount() { return transactionsCount; }
    public void setTransactionsCount(Integer transactionsCount) { this.transactionsCount = transactionsCount; }
}
