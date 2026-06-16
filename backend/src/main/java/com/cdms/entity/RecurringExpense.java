package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_expenses")
public class RecurringExpense {
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

    @Column(nullable = false)
    private String frequency;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "last_processed_date")
    private LocalDate lastProcessedDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_by")
    private String createdBy;

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

    public RecurringExpense() {}

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
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
    public LocalDate getLastProcessedDate() { return lastProcessedDate; }
    public void setLastProcessedDate(LocalDate lastProcessedDate) { this.lastProcessedDate = lastProcessedDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
