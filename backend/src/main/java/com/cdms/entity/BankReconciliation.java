package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_reconciliations")
public class BankReconciliation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "bank_statement_date", nullable = false)
    private LocalDate bankStatementDate;

    @Column(name = "bank_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal bankBalance;

    @Column(name = "book_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal bookBalance;

    @Column(precision = 12, scale = 2)
    private BigDecimal difference;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "reconciled_by_id")
    private Long reconciledById;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

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

    public BankReconciliation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public LocalDate getBankStatementDate() { return bankStatementDate; }
    public void setBankStatementDate(LocalDate bankStatementDate) { this.bankStatementDate = bankStatementDate; }
    public BigDecimal getBankBalance() { return bankBalance; }
    public void setBankBalance(BigDecimal bankBalance) { this.bankBalance = bankBalance; }
    public BigDecimal getBookBalance() { return bookBalance; }
    public void setBookBalance(BigDecimal bookBalance) { this.bookBalance = bookBalance; }
    public BigDecimal getDifference() { return difference; }
    public void setDifference(BigDecimal difference) { this.difference = difference; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getReconciledById() { return reconciledById; }
    public void setReconciledById(Long reconciledById) { this.reconciledById = reconciledById; }
    public LocalDateTime getReconciledAt() { return reconciledAt; }
    public void setReconciledAt(LocalDateTime reconciledAt) { this.reconciledAt = reconciledAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
