package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDto {
    private Long id;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;
    private LocalDate expenseDate;
    private String paymentMethod;
    private String receiptUrl;
    private String approvedBy;
    private Boolean receiptAttached;
    private Long approvedByUserId;

    public ExpenseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
}
