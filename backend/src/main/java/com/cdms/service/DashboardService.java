package com.cdms.service;

import com.cdms.dto.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final MemberService memberService;
    private final AttendanceService attendanceService;
    private final FinancialService financialService;
    private final EventService eventService;
    private final PrayerRequestService prayerRequestService;

    public DashboardService(MemberService memberService, AttendanceService attendanceService,
                           FinancialService financialService, EventService eventService,
                           PrayerRequestService prayerRequestService) {
        this.memberService = memberService;
        this.attendanceService = attendanceService;
        this.financialService = financialService;
        this.eventService = eventService;
        this.prayerRequestService = prayerRequestService;
    }

    public DashboardDto getDashboardData() {
        DashboardDto dashboard = new DashboardDto();

        dashboard.setTotalMembers(memberService.getActiveMemberCount());
        dashboard.setActiveMembers(memberService.getActiveMemberCount());
        dashboard.setAttendanceToday(attendanceService.getAttendanceCountByDate(LocalDate.now()));

        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        BigDecimal totalDonations = financialService.getTotalDonations(monthStart, monthEnd);
        BigDecimal totalTithes = financialService.getTotalTithes(monthStart, monthEnd);
        BigDecimal totalOfferings = financialService.getTotalOfferings(monthStart, monthEnd);
        BigDecimal totalIncome = totalDonations.add(totalTithes).add(totalOfferings);
        BigDecimal totalExpenses = financialService.getTotalExpenses(monthStart, monthEnd);

        dashboard.setTotalDonations(totalIncome);
        dashboard.setTotalExpenses(totalExpenses);
        dashboard.setNetBalance(totalIncome.subtract(totalExpenses));
        dashboard.setUpcomingEvents(eventService.getUpcomingEventsCount());
        dashboard.setPendingPrayerRequests(prayerRequestService.getPendingPrayerRequestsCount());

        dashboard.setMonthlyFinancials(getMonthlyFinancials());
        dashboard.setAttendanceTrends(getAttendanceTrends());

        return dashboard;
    }

    private List<MonthlyFinancialDto> getMonthlyFinancials() {
        List<MonthlyFinancialDto> monthlyFinancials = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();

            BigDecimal donations = financialService.getTotalDonations(monthStart, monthEnd)
                    .add(financialService.getTotalTithes(monthStart, monthEnd))
                    .add(financialService.getTotalOfferings(monthStart, monthEnd));
            BigDecimal expenses = financialService.getTotalExpenses(monthStart, monthEnd);

            monthlyFinancials.add(new MonthlyFinancialDto(month.toString(), donations, expenses));
        }

        return monthlyFinancials;
    }

    private List<AttendanceTrendDto> getAttendanceTrends() {
        List<AttendanceTrendDto> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long count = attendanceService.getAttendanceCountByDate(date);
            trends.add(new AttendanceTrendDto(date.toString(), count));
        }

        return trends;
    }
}
