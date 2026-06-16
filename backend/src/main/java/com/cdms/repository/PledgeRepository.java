package com.cdms.repository;

import com.cdms.entity.Pledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PledgeRepository extends JpaRepository<Pledge, Long> {
    List<Pledge> findByChurchId(Long churchId);
    List<Pledge> findByMemberId(Long memberId);
    List<Pledge> findByStatus(String status);
    List<Pledge> findByChurchIdAndStatus(Long churchId, String status);
    List<Pledge> findByDueDateBefore(LocalDate date);
    List<Pledge> findByMemberIdAndStatus(Long memberId, String status);

    @Query("SELECT COALESCE(SUM(p.pledgeAmount), 0) FROM Pledge p WHERE p.status = :status")
    BigDecimal sumPledgeAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.pledgeAmount), 0) FROM Pledge p WHERE p.churchId = :churchId AND p.status = :status")
    BigDecimal sumPledgeAmountByChurchIdAndStatus(@Param("churchId") Long churchId, @Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Pledge p WHERE p.status = :status")
    BigDecimal sumAmountPaidByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Pledge p WHERE p.churchId = :churchId AND p.status = :status")
    BigDecimal sumAmountPaidByChurchIdAndStatus(@Param("churchId") Long churchId, @Param("status") String status);
}
