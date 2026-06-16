package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly")
    private BigDecimal priceMonthly;

    @Column(name = "price_annual")
    private BigDecimal priceAnnual;

    @Column(name = "max_members", nullable = false)
    private int maxMembers = -1;

    @Column(name = "max_users", nullable = false)
    private int maxUsers = -1;

    @Column(name = "max_storage_mb")
    private Integer maxStorageMb = 1000;

    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(nullable = false)
    private boolean enabled = true;

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

    public SubscriptionPlan() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPriceMonthly() { return priceMonthly; }
    public void setPriceMonthly(BigDecimal priceMonthly) { this.priceMonthly = priceMonthly; }
    public BigDecimal getPriceAnnual() { return priceAnnual; }
    public void setPriceAnnual(BigDecimal priceAnnual) { this.priceAnnual = priceAnnual; }
    public int getMaxMembers() { return maxMembers; }
    public void setMaxMembers(int maxMembers) { this.maxMembers = maxMembers; }
    public int getMaxUsers() { return maxUsers; }
    public void setMaxUsers(int maxUsers) { this.maxUsers = maxUsers; }
    public Integer getMaxStorageMb() { return maxStorageMb; }
    public void setMaxStorageMb(Integer maxStorageMb) { this.maxStorageMb = maxStorageMb; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
