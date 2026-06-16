package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceiptDto {
    private Long id;
    private String receiptNumber;
    private Long memberId;
    private String memberName;

    @NotBlank(message = "Contribution type is required")
    private String contributionType;

    @NotNull(message = "Contribution ID is required")
    private Long contributionId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private LocalDate receiptDate;
    private String treasurerName;
    private String treasurerSignature;
    private String notes;
    private String status;

    public ReceiptDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getContributionType() { return contributionType; }
    public void setContributionType(String contributionType) { this.contributionType = contributionType; }
    public Long getContributionId() { return contributionId; }
    public void setContributionId(Long contributionId) { this.contributionId = contributionId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public String getTreasurerName() { return treasurerName; }
    public void setTreasurerName(String treasurerName) { this.treasurerName = treasurerName; }
    public String getTreasurerSignature() { return treasurerSignature; }
    public void setTreasurerSignature(String treasurerSignature) { this.treasurerSignature = treasurerSignature; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
