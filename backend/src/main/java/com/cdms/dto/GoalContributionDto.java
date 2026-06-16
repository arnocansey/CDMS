package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class GoalContributionDto {
    private Long id;

    @NotNull(message = "Goal ID is required")
    private Long goalId;

    private Long memberId;
    private String memberName;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Contribution date is required")
    private LocalDate contributionDate;

    private String paymentMethod;
    private String referenceNumber;
    private String notes;
    private String recordedBy;

    public GoalContributionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getContributionDate() { return contributionDate; }
    public void setContributionDate(LocalDate contributionDate) { this.contributionDate = contributionDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
}
