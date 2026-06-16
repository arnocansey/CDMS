package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class OfferingDto {
    private Long id;
    private LocalDate serviceDate;

    @NotNull(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String offeringType;
    private String description;
    private String recordedBy;

    public OfferingDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getOfferingType() { return offeringType; }
    public void setOfferingType(String offeringType) { this.offeringType = offeringType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
}
