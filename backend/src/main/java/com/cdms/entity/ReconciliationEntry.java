package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconciliation_entries")
public class ReconciliationEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id", nullable = false)
    private BankReconciliation reconciliation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_flow_entry_id")
    private CashFlowEntry cashFlowEntry;

    @Column(nullable = false)
    private Boolean matched = false;

    @Column(name = "bank_amount", precision = 12, scale = 2)
    private BigDecimal bankAmount;

    @Column(name = "book_amount", precision = 12, scale = 2)
    private BigDecimal bookAmount;

    private String description;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ReconciliationEntry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public BankReconciliation getReconciliation() { return reconciliation; }
    public void setReconciliation(BankReconciliation reconciliation) { this.reconciliation = reconciliation; }
    public CashFlowEntry getCashFlowEntry() { return cashFlowEntry; }
    public void setCashFlowEntry(CashFlowEntry cashFlowEntry) { this.cashFlowEntry = cashFlowEntry; }
    public Boolean getMatched() { return matched; }
    public void setMatched(Boolean matched) { this.matched = matched; }
    public BigDecimal getBankAmount() { return bankAmount; }
    public void setBankAmount(BigDecimal bankAmount) { this.bankAmount = bankAmount; }
    public BigDecimal getBookAmount() { return bookAmount; }
    public void setBookAmount(BigDecimal bookAmount) { this.bookAmount = bookAmount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
