package com.cdms.repository;

import com.cdms.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByChurchId(Long churchId);
    List<Donation> findByDonationDateBetween(LocalDate startDate, LocalDate endDate);
    List<Donation> findByChurchIdAndDonationDateBetween(Long churchId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.donationDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.churchId = :churchId AND d.donationDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByChurchIdAndDateRange(@Param("churchId") Long churchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.category = :category AND d.donationDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndDateRange(@Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Donation> findByMemberId(Long memberId);
    
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.churchId = :churchId AND d.member.id = :memberId")
    BigDecimal sumByChurchIdAndMemberId(@Param("churchId") Long churchId, @Param("memberId") Long memberId);
}
