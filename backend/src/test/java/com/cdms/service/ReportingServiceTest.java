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
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

    @Mock
    private MemberService memberService;

    @Mock
    private AttendanceService attendanceService;

    @Mock
    private FinancialService financialService;

    @Mock
    private EventService eventService;

    @InjectMocks
    private ReportingService reportingService;

    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.now().minusDays(30);
        endDate = LocalDate.now();
    }

    @Test
    void generateMembershipReportPdf_ReturnsBytes() {
        when(memberService.getAllMembers(any())).thenReturn(
                new org.springframework.data.domain.PageImpl<>(Collections.emptyList()));

        byte[] result = reportingService.generateMembershipReportPdf();

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateMembershipReportExcel_ReturnsBytes() {
        when(memberService.getAllMembers(any())).thenReturn(
                new org.springframework.data.domain.PageImpl<>(Collections.emptyList()));

        byte[] result = reportingService.generateMembershipReportExcel();

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateFinancialReportPdf_ReturnsBytes() {
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(5000));
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(3000));
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(2000));
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(1500));

        byte[] result = reportingService.generateFinancialReportPdf(startDate, endDate);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateFinancialReportExcel_ReturnsBytes() {
        when(financialService.getTotalDonations(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(5000));
        when(financialService.getTotalTithes(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(3000));
        when(financialService.getTotalOfferings(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(2000));
        when(financialService.getTotalExpenses(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(1500));

        byte[] result = reportingService.generateFinancialReportExcel(startDate, endDate);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateAttendanceReportPdf_ReturnsBytes() {
        when(attendanceService.getAttendanceCountByDateRange(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(350L);

        byte[] result = reportingService.generateAttendanceReportPdf(startDate, endDate);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }
}
