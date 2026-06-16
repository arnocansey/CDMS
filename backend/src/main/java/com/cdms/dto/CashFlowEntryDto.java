package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CashFlowEntryDto {
    private Long id;

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotBlank(message = "Entry type is required")
    private String entryType;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String referenceNumber;
    private String source;
    private Long sourceId;
    private String createdBy;

    public CashFlowEntryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
