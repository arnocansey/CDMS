package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "receipt_number", nullable = false)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "contribution_type")
    private String contributionType;

    @Column(name = "contribution_id")
    private Long contributionId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "receipt_date", nullable = false)
    private LocalDate receiptDate;

    @Column(name = "treasurer_name")
    private String treasurerName;

    @Column(name = "treasurer_signature")
    private String treasurerSignature;

    private String notes;

    @Column(nullable = false)
    private String status = "ISSUED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Receipt() {}

    public Receipt(String receiptNumber, BigDecimal amount, LocalDate receiptDate) {
        this.receiptNumber = receiptNumber;
        this.amount = amount;
        this.receiptDate = receiptDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getContributionType() { return contributionType; }
    public void setContributionType(String contributionType) { this.contributionType = contributionType; }
    public Long getContributionId() { return contributionId; }
    public void setContributionId(Long contributionId) { this.contributionId = contributionId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public String getTreasurerName() { return treasurerName; }
    public void setTreasurerName(String treasurerName) { this.treasurerName = treasurerName; }
    public String getTreasurerSignature() { return treasurerSignature; }
    public void setTreasurerSignature(String treasurerSignature) { this.treasurerSignature = treasurerSignature; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
