package com.cdms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donor_retention")
public class DonorRetention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String period;

    @Column(name = "total_given", precision = 12, scale = 2)
    private BigDecimal totalGiven;

    @Column(name = "donation_count")
    private Integer donationCount;

    @Column(name = "retention_status", nullable = false)
    private String retentionStatus;

    @Column(name = "average_gift", precision = 10, scale = 2)
    private BigDecimal averageGift;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public DonorRetention() {}

    public DonorRetention(Member member, String period, BigDecimal totalGiven,
                          Integer donationCount, String retentionStatus) {
        this.member = member;
        this.period = period;
        this.totalGiven = totalGiven;
        this.donationCount = donationCount;
        this.retentionStatus = retentionStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public BigDecimal getTotalGiven() { return totalGiven; }
    public void setTotalGiven(BigDecimal totalGiven) { this.totalGiven = totalGiven; }
    public Integer getDonationCount() { return donationCount; }
    public void setDonationCount(Integer donationCount) { this.donationCount = donationCount; }
    public String getRetentionStatus() { return retentionStatus; }
    public void setRetentionStatus(String retentionStatus) { this.retentionStatus = retentionStatus; }
    public BigDecimal getAverageGift() { return averageGift; }
    public void setAverageGift(BigDecimal averageGift) { this.averageGift = averageGift; }
    public LocalDate getLastDonationDate() { return lastDonationDate; }
    public void setLastDonationDate(LocalDate lastDonationDate) { this.lastDonationDate = lastDonationDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
