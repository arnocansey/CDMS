package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "service_type", nullable = false)
    private String serviceType;

    @Column(nullable = false)
    private boolean present = true;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        checkInTime = LocalDateTime.now();
    }

    public Attendance() {}

    public Attendance(Member member, LocalDate serviceDate, String serviceType) {
        this.member = member;
        this.serviceDate = serviceDate;
        this.serviceType = serviceType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
