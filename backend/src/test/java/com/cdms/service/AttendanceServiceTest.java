package com.cdms.service;

import com.cdms.dto.AttendanceDto;
import com.cdms.entity.Attendance;
import com.cdms.entity.Member;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.AttendanceRepository;
import com.cdms.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private Attendance attendance;
    private Member member;

    @BeforeEach
    void setUp() {
        member = new Member();
        member.setId(1L);
        member.setFirstName("John");
        member.setLastName("Doe");

        attendance = new Attendance();
        attendance.setId(1L);
        attendance.setMember(member);
        attendance.setServiceDate(LocalDate.now());
        attendance.setServiceType("Sunday Service");
        attendance.setPresent(true);
    }

    @Test
    void getAttendanceByDate_Success() {
        when(attendanceRepository.findByServiceDate(LocalDate.now())).thenReturn(Arrays.asList(attendance));

        List<AttendanceDto> result = attendanceService.getAttendanceByDate(LocalDate.now());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMemberName()).isEqualTo("John Doe");
    }

    @Test
    void recordAttendance_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        AttendanceDto dto = new AttendanceDto();
        dto.setMemberId(1L);
        dto.setServiceDate(LocalDate.now());
        dto.setServiceType("Sunday Service");
        dto.setPresent(true);

        AttendanceDto result = attendanceService.recordAttendance(dto);

        assertThat(result).isNotNull();
        assertThat(result.getMemberName()).isEqualTo("John Doe");
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void recordAttendance_MemberNotFound_ThrowsException() {
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        AttendanceDto dto = new AttendanceDto();
        dto.setMemberId(999L);
        dto.setServiceDate(LocalDate.now());
        dto.setServiceType("Sunday Service");

        assertThatThrownBy(() -> attendanceService.recordAttendance(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Member not found with id: 999");
    }

    @Test
    void getAttendanceCountByDate_ReturnsCount() {
        when(attendanceRepository.countPresentByDate(LocalDate.now())).thenReturn(50L);

        long result = attendanceService.getAttendanceCountByDate(LocalDate.now());

        assertThat(result).isEqualTo(50L);
    }

    @Test
    void getMemberAttendance_ReturnsList() {
        when(attendanceRepository.findByMemberAndDateRange(1L, LocalDate.now().minusDays(7), LocalDate.now()))
                .thenReturn(Arrays.asList(attendance));

        List<AttendanceDto> result = attendanceService.getMemberAttendance(1L, LocalDate.now().minusDays(7), LocalDate.now());

        assertThat(result).hasSize(1);
    }

    @Test
    void getAttendanceCountByDateRange_ReturnsCount() {
        when(attendanceRepository.countPresentByDateRange(LocalDate.now().minusDays(7), LocalDate.now()))
                .thenReturn(350L);

        long result = attendanceService.getAttendanceCountByDateRange(LocalDate.now().minusDays(7), LocalDate.now());

        assertThat(result).isEqualTo(350L);
    }
}
