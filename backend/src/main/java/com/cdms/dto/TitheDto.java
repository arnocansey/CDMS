package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TitheDto {
    private Long id;

    @NotNull(message = "Member ID is required")
    private Long memberId;

    private String memberName;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private LocalDate titheDate;
    private String paymentMethod;
    private String referenceNumber;

    public TitheDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getTitheDate() { return titheDate; }
    public void setTitheDate(LocalDate titheDate) { this.titheDate = titheDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}
