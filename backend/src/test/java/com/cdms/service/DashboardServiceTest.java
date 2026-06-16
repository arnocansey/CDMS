package com.cdms.service;

import com.cdms.dto.AttendanceTrendDto;
import com.cdms.dto.DashboardDto;
import com.cdms.dto.MonthlyFinancialDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MemberService memberService;

    @Mock
    private AttendanceService attendanceService;

    @Mock
    private FinancialService financialService;

    @Mock
    private EventService eventService;

    @Mock
    private PrayerRequestService prayerRequestService;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getDashboardData_ReturnsDashboard() {
        when(memberService.getActiveMemberCount()).thenReturn(150L);
        when(attendanceService.getAttendanceCountByDate(any(LocalDate.class))).thenReturn(120L);
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(5000));
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(3000));
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(2000));
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(1500));
        when(eventService.getUpcomingEventsCount()).thenReturn(5L);
        when(prayerRequestService.getPendingPrayerRequestsCount()).thenReturn(3L);

        DashboardDto result = dashboardService.getDashboardData();

        assertThat(result).isNotNull();
        assertThat(result.getTotalMembers()).isEqualTo(150L);
        assertThat(result.getActiveMembers()).isEqualTo(150L);
        assertThat(result.getAttendanceToday()).isEqualTo(120L);
        assertThat(result.getUpcomingEvents()).isEqualTo(5L);
        assertThat(result.getPendingPrayerRequests()).isEqualTo(3L);
    }

    @Test
    void getDashboardData_FinancialTotals() {
        when(memberService.getActiveMemberCount()).thenReturn(10L);
        when(attendanceService.getAttendanceCountByDate(any(LocalDate.class))).thenReturn(50L);
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(5000));
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(3000));
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(2000));
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(1500));
        when(eventService.getUpcomingEventsCount()).thenReturn(2L);
        when(prayerRequestService.getPendingPrayerRequestsCount()).thenReturn(1L);

        DashboardDto result = dashboardService.getDashboardData();

        assertThat(result).isNotNull();
        assertThat(result.getTotalDonations()).isNotNull();
        assertThat(result.getTotalExpenses()).isNotNull();
        assertThat(result.getNetBalance()).isNotNull();
    }

    @Test
    void getDashboardData_MonthlyFinancialsNotEmpty() {
        when(memberService.getActiveMemberCount()).thenReturn(10L);
        when(attendanceService.getAttendanceCountByDate(any(LocalDate.class))).thenReturn(50L);
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(1000));
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(500));
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(300));
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(200));
        when(eventService.getUpcomingEventsCount()).thenReturn(1L);
        when(prayerRequestService.getPendingPrayerRequestsCount()).thenReturn(0L);

        DashboardDto result = dashboardService.getDashboardData();

        assertThat(result.getMonthlyFinancials()).isNotNull();
        assertThat(result.getMonthlyFinancials()).hasSize(6);
    }

    @Test
    void getDashboardData_AttendanceTrendsNotEmpty() {
        when(memberService.getActiveMemberCount()).thenReturn(10L);
        when(attendanceService.getAttendanceCountByDate(any(LocalDate.class))).thenReturn(50L);
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);
        when(eventService.getUpcomingEventsCount()).thenReturn(0L);
        when(prayerRequestService.getPendingPrayerRequestsCount()).thenReturn(0L);

        DashboardDto result = dashboardService.getDashboardData();

        assertThat(result.getAttendanceTrends()).isNotNull();
        assertThat(result.getAttendanceTrends()).hasSize(7);
    }
}
