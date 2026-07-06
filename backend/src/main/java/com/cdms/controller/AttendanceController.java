package com.cdms.controller;

import com.cdms.dto.AttendanceDto;
import com.cdms.repository.AttendanceRepository;
import com.cdms.security.TenantContext;
import com.cdms.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceService attendanceService, AttendanceRepository attendanceRepository) {
        this.attendanceService = attendanceService;
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAttendanceByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDto> attendance = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAttendanceStats() {
        long todayCount = attendanceRepository.countPresentByDate(LocalDate.now());
        return ResponseEntity.ok(Map.of("attendanceToday", todayCount));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<AttendanceDto>> getMemberAttendance(
            @PathVariable Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        List<AttendanceDto> attendance = attendanceService.getMemberAttendance(memberId, start, end);
        return ResponseEntity.ok(attendance);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<AttendanceDto> recordAttendance(@Valid @RequestBody AttendanceDto attendanceDto) {
        AttendanceDto attendance = attendanceService.recordAttendance(attendanceDto);
        return ResponseEntity.ok(attendance);
    }
}
