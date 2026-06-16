package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pledges")
public class Pledge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "pledge_type")
    private String pledgeType;

    private String description;

    @Column(name = "pledge_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal pledgeAmount;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private String frequency = "ONE_TIME";

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

    public Pledge() {}

    public Pledge(Member member, String pledgeType, BigDecimal pledgeAmount) {
        this.member = member;
        this.pledgeType = pledgeType;
        this.pledgeAmount = pledgeAmount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getPledgeType() { return pledgeType; }
    public void setPledgeType(String pledgeType) { this.pledgeType = pledgeType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPledgeAmount() { return pledgeAmount; }
    public void setPledgeAmount(BigDecimal pledgeAmount) { this.pledgeAmount = pledgeAmount; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
