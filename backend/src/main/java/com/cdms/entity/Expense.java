package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    private String description;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "receipt_attached")
    private Boolean receiptAttached;

    @Column(name = "approved_by_user_id")
    private Long approvedByUserId;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "APPROVED";

    @Column(name = "approved_by_id")
    private Long approvedById;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Expense() {}

    public Expense(String category, BigDecimal amount, LocalDate expenseDate) {
        this.category = category;
        this.amount = amount;
        this.expenseDate = expenseDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public Boolean getReceiptAttached() { return receiptAttached; }
    public void setReceiptAttached(Boolean receiptAttached) { this.receiptAttached = receiptAttached; }
    public Long getApprovedByUserId() { return approvedByUserId; }
    public void setApprovedByUserId(Long approvedByUserId) { this.approvedByUserId = approvedByUserId; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public Long getApprovedById() { return approvedById; }
    public void setApprovedById(Long approvedById) { this.approvedById = approvedById; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
