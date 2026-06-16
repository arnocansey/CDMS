package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PledgePaymentDto {
    private Long id;

    @NotNull(message = "Pledge ID is required")
    private Long pledgeId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private String paymentMethod;
    private String referenceNumber;
    private String notes;
    private String recordedBy;

    public PledgePaymentDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPledgeId() { return pledgeId; }
    public void setPledgeId(Long pledgeId) { this.pledgeId = pledgeId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
}
