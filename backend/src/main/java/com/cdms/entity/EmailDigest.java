package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_digests")
public class EmailDigest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "digest_type", nullable = false)
    private String digestType;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "last_sent_date")
    private LocalDate lastSentDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public EmailDigest() {}

    public EmailDigest(Long churchId, String recipientEmail, String recipientName, String digestType) {
        this.churchId = churchId;
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.digestType = digestType;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getDigestType() { return digestType; }
    public void setDigestType(String digestType) { this.digestType = digestType; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public LocalDate getLastSentDate() { return lastSentDate; }
    public void setLastSentDate(LocalDate lastSentDate) { this.lastSentDate = lastSentDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
