package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FundTransactionDto {
    private Long id;

    @NotNull(message = "Fund ID is required")
    private Long fundId;

    private String fundName;

    @NotBlank(message = "Transaction type is required")
    private String transactionType;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;
    private String referenceNumber;
    private String sourceType;
    private Long sourceId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private String createdBy;

    public FundTransactionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFundId() { return fundId; }
    public void setFundId(Long fundId) { this.fundId = fundId; }
    public String getFundName() { return fundName; }
    public void setFundName(String fundName) { this.fundName = fundName; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
