package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_flow_entries")
public class CashFlowEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "entry_type", nullable = false)
    private String entryType;

    @Column(nullable = false)
    private String category;

    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "reference_number")
    private String referenceNumber;

    private String source;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public CashFlowEntry() {}

    public CashFlowEntry(LocalDate entryDate, String entryType, String category, BigDecimal amount) {
        this.entryDate = entryDate;
        this.entryType = entryType;
        this.category = category;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
