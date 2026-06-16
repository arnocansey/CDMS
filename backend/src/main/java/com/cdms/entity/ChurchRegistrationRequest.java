package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "church_registration_requests")
public class ChurchRegistrationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_name", nullable = false)
    private String churchName;

    @Column(name = "church_slug", nullable = false)
    private String churchSlug;

    @Column(name = "church_email")
    private String churchEmail;

    @Column(name = "church_phone")
    private String churchPhone;

    @Column(name = "church_city")
    private String churchCity;

    @Column(name = "church_state")
    private String churchState;

    @Column(name = "requester_name", nullable = false)
    private String requesterName;

    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;

    @Column(name = "requester_message", columnDefinition = "TEXT")
    private String requesterMessage;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

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

    public ChurchRegistrationRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getChurchName() { return churchName; }
    public void setChurchName(String churchName) { this.churchName = churchName; }
    public String getChurchSlug() { return churchSlug; }
    public void setChurchSlug(String churchSlug) { this.churchSlug = churchSlug; }
    public String getChurchEmail() { return churchEmail; }
    public void setChurchEmail(String churchEmail) { this.churchEmail = churchEmail; }
    public String getChurchPhone() { return churchPhone; }
    public void setChurchPhone(String churchPhone) { this.churchPhone = churchPhone; }
    public String getChurchCity() { return churchCity; }
    public void setChurchCity(String churchCity) { this.churchCity = churchCity; }
    public String getChurchState() { return churchState; }
    public void setChurchState(String churchState) { this.churchState = churchState; }
    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }
    public String getRequesterMessage() { return requesterMessage; }
    public void setRequesterMessage(String requesterMessage) { this.requesterMessage = requesterMessage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
