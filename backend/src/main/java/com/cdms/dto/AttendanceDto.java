package com.cdms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceDto {
    private Long id;

    @NotNull(message = "Member ID is required")
    private Long memberId;

    private String memberName;
    private LocalDate serviceDate;

    @NotNull(message = "Service type is required")
    private String serviceType;

    private boolean present;
    private LocalDateTime checkInTime;

    public AttendanceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
}
