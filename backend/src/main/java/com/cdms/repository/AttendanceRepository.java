package com.cdms.repository;

import com.cdms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByServiceDate(LocalDate serviceDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.member.id = :memberId AND a.serviceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findByMemberAndDateRange(@Param("memberId") Long memberId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.serviceDate = :serviceDate AND a.present = true")
    long countPresentByDate(@Param("serviceDate") LocalDate serviceDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.serviceDate BETWEEN :startDate AND :endDate AND a.present = true")
    long countPresentByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
