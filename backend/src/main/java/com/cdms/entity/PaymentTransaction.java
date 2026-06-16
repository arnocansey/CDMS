package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "paystack_reference", unique = true)
    private String paystackReference;

    @Column(name = "paystack_access_code")
    private String paystackAccessCode;

    @Column(name = "paystack_authorization_code")
    private String paystackAuthorizationCode;

    @Column(name = "amount", nullable = false)
    private java.math.BigDecimal amount;

    @Column(name = "currency", nullable = false)
    private String currency = "NGN";

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "billing_cycle", nullable = false)
    private String billingCycle = "MONTHLY";

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "paystack_response", columnDefinition = "TEXT")
    private String paystackResponse;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PaymentTransaction() {}

    public PaymentTransaction(Long churchId, Long userId, Long planId, java.math.BigDecimal amount, String currency, String billingCycle) {
        this.churchId = churchId;
        this.userId = userId;
        this.planId = planId;
        this.amount = amount;
        this.currency = currency;
        this.billingCycle = billingCycle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getPaystackReference() { return paystackReference; }
    public void setPaystackReference(String paystackReference) { this.paystackReference = paystackReference; }
    public String getPaystackAccessCode() { return paystackAccessCode; }
    public void setPaystackAccessCode(String paystackAccessCode) { this.paystackAccessCode = paystackAccessCode; }
    public String getPaystackAuthorizationCode() { return paystackAuthorizationCode; }
    public void setPaystackAuthorizationCode(String code) { this.paystackAuthorizationCode = code; }
    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaystackResponse() { return paystackResponse; }
    public void setPaystackResponse(String paystackResponse) { this.paystackResponse = paystackResponse; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
