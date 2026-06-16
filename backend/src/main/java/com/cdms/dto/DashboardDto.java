package com.cdms.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {
    private long totalMembers;
    private long activeMembers;
    private long attendanceToday;
    private BigDecimal totalDonations;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private long upcomingEvents;
    private long pendingPrayerRequests;
    private List<MonthlyFinancialDto> monthlyFinancials;
    private List<AttendanceTrendDto> attendanceTrends;

    public DashboardDto() {}

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }
    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }
    public long getAttendanceToday() { return attendanceToday; }
    public void setAttendanceToday(long attendanceToday) { this.attendanceToday = attendanceToday; }
    public BigDecimal getTotalDonations() { return totalDonations; }
    public void setTotalDonations(BigDecimal totalDonations) { this.totalDonations = totalDonations; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }
    public long getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(long upcomingEvents) { this.upcomingEvents = upcomingEvents; }
    public long getPendingPrayerRequests() { return pendingPrayerRequests; }
    public void setPendingPrayerRequests(long pendingPrayerRequests) { this.pendingPrayerRequests = pendingPrayerRequests; }
    public List<MonthlyFinancialDto> getMonthlyFinancials() { return monthlyFinancials; }
    public void setMonthlyFinancials(List<MonthlyFinancialDto> monthlyFinancials) { this.monthlyFinancials = monthlyFinancials; }
    public List<AttendanceTrendDto> getAttendanceTrends() { return attendanceTrends; }
    public void setAttendanceTrends(List<AttendanceTrendDto> attendanceTrends) { this.attendanceTrends = attendanceTrends; }
}
