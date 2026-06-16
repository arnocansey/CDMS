package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "funds")
public class Fund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "fund_type")
    private String fundType;

    @Column(name = "opening_balance", precision = 12, scale = 2)
    private BigDecimal openingBalance;

    @Column(name = "current_balance", precision = 12, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "target_amount", precision = 12, scale = 2)
    private BigDecimal targetAmount;

    private boolean active = true;

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

    public Fund() {}

    public Fund(String name, String fundType, BigDecimal openingBalance) {
        this.name = name;
        this.fundType = fundType;
        this.openingBalance = openingBalance;
        this.currentBalance = openingBalance;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFundType() { return fundType; }
    public void setFundType(String fundType) { this.fundType = fundType; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
