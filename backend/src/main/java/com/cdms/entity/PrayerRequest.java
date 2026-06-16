package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prayer_requests")
public class PrayerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PrayerRequestStatus status = PrayerRequestStatus.PENDING;

    private boolean anonymous = false;

    @Column(name = "prayed_by")
    private String prayedBy;

    @Column(name = "prayed_at")
    private LocalDateTime prayedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum PrayerRequestStatus {
        PENDING,
        IN_PROGRESS,
        ANSWERED,
        CLOSED
    }

    public PrayerRequest() {}

    public PrayerRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public PrayerRequestStatus getStatus() { return status; }
    public void setStatus(PrayerRequestStatus status) { this.status = status; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public String getPrayedBy() { return prayedBy; }
    public void setPrayedBy(String prayedBy) { this.prayedBy = prayedBy; }
    public LocalDateTime getPrayedAt() { return prayedAt; }
    public void setPrayedAt(LocalDateTime prayedAt) { this.prayedAt = prayedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
