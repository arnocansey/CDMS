package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PledgeDto {
    private Long id;

    @NotNull(message = "Member ID is required")
    private Long memberId;

    private String memberName;

    @NotBlank(message = "Pledge type is required")
    private String pledgeType;

    private String description;

    @NotNull(message = "Pledge amount is required")
    private BigDecimal pledgeAmount;

    private BigDecimal amountPaid;
    private BigDecimal outstandingBalance;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String status;
    private String frequency;
    private String createdBy;

    public PledgeDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getPledgeType() { return pledgeType; }
    public void setPledgeType(String pledgeType) { this.pledgeType = pledgeType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPledgeAmount() { return pledgeAmount; }
    public void setPledgeAmount(BigDecimal pledgeAmount) { this.pledgeAmount = pledgeAmount; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    public BigDecimal getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(BigDecimal outstandingBalance) { this.outstandingBalance = outstandingBalance; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
