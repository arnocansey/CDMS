package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DonationDto {
    private Long id;
    private Long memberId;
    private String memberName;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private String category;

    private String description;
    private LocalDate donationDate;
    private String paymentMethod;
    private String referenceNumber;

    public DonationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDonationDate() { return donationDate; }
    public void setDonationDate(LocalDate donationDate) { this.donationDate = donationDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}
