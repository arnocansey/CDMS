package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitors")
public class Visitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "first_visit_date")
    private LocalDate firstVisitDate;

    @Column(name = "visit_count", nullable = false)
    private Integer visitCount = 1;

    @Column(name = "status", nullable = false)
    private String status = "FIRST_TIME";

    @Column(name = "referred_by")
    private String referredBy;

    @Column(name = "notes")
    private String notes;

    @Column(name = "interested_in_membership", nullable = false)
    private boolean interestedInMembership = false;

    @Column(name = "follow_up_status", nullable = false)
    private String followUpStatus = "NONE";

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes")
    private String followUpNotes;

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

    public Visitor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
    public LocalDate getFirstVisitDate() { return firstVisitDate; }
    public void setFirstVisitDate(LocalDate firstVisitDate) { this.firstVisitDate = firstVisitDate; }
    public Integer getVisitCount() { return visitCount; }
    public void setVisitCount(Integer visitCount) { this.visitCount = visitCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReferredBy() { return referredBy; }
    public void setReferredBy(String referredBy) { this.referredBy = referredBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isInterestedInMembership() { return interestedInMembership; }
    public void setInterestedInMembership(boolean interestedInMembership) { this.interestedInMembership = interestedInMembership; }
    public String getFollowUpStatus() { return followUpStatus; }
    public void setFollowUpStatus(String followUpStatus) { this.followUpStatus = followUpStatus; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
