package com.cdms.dto;

import jakarta.validation.constraints.NotBlank;
import com.cdms.entity.PrayerRequest.PrayerRequestStatus;

public class PrayerRequestDto {
    private Long id;
    private Long memberId;
    private String memberName;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private PrayerRequestStatus status;
    private boolean anonymous;
    private String prayedBy;

    public PrayerRequestDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
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
}
