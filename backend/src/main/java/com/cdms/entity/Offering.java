package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offerings")
public class Offering {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "service_type", nullable = false)
    private String serviceType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "offering_type")
    private String offeringType;

    private String description;

    @Column(name = "recorded_by")
    private String recordedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Offering() {}

    public Offering(LocalDate serviceDate, String serviceType, BigDecimal amount) {
        this.serviceDate = serviceDate;
        this.serviceType = serviceType;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getOfferingType() { return offeringType; }
    public void setOfferingType(String offeringType) { this.offeringType = offeringType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
