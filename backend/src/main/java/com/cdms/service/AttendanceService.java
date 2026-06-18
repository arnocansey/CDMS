package com.cdms.service;

import com.cdms.dto.AttendanceDto;
import com.cdms.entity.Attendance;
import com.cdms.entity.Member;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.AttendanceRepository;
import com.cdms.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, MemberRepository memberRepository) {
        this.attendanceRepository = attendanceRepository;
        this.memberRepository = memberRepository;
    }

    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByServiceDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getMemberAttendance(Long memberId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByMemberAndDateRange(memberId, startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDto recordAttendance(AttendanceDto attendanceDto) {
        Member member = memberRepository.findById(attendanceDto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", attendanceDto.getMemberId()));

        Attendance attendance = new Attendance();
        attendance.setChurchId(TenantContext.getChurchId());
        attendance.setMember(member);
        attendance.setServiceDate(attendanceDto.getServiceDate() != null ? attendanceDto.getServiceDate() : LocalDate.now());
        attendance.setServiceType(attendanceDto.getServiceType());
        attendance.setPresent(attendanceDto.isPresent());

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToDto(savedAttendance);
    }

    public long getAttendanceCountByDate(LocalDate date) {
        return attendanceRepository.countPresentByDate(date);
    }

    public long getAttendanceCountByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.countPresentByDateRange(startDate, endDate);
    }

    private AttendanceDto mapToDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setMemberId(attendance.getMember().getId());
        dto.setMemberName(attendance.getMember().getFirstName() + " " + attendance.getMember().getLastName());
        dto.setServiceDate(attendance.getServiceDate());
        dto.setServiceType(attendance.getServiceType());
        dto.setPresent(attendance.isPresent());
        dto.setCheckInTime(attendance.getCheckInTime());
        return dto;
    }
}
