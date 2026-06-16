package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "church_transfers")
public class ChurchTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "from_church_id", nullable = false)
    private Long fromChurchId;

    @Column(name = "to_church_id", nullable = false)
    private Long toChurchId;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "approved_by")
    private String approvedBy;

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

    public ChurchTransfer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public Long getFromChurchId() { return fromChurchId; }
    public void setFromChurchId(Long fromChurchId) { this.fromChurchId = fromChurchId; }
    public Long getToChurchId() { return toChurchId; }
    public void setToChurchId(Long toChurchId) { this.toChurchId = toChurchId; }
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
