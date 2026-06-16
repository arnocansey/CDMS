package com.cdms.repository;

import com.cdms.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
    List<Receipt> findByMemberId(Long memberId);
    List<Receipt> findByContributionType(String contributionType);
    List<Receipt> findByReceiptDateBetween(LocalDate startDate, LocalDate endDate);
    boolean existsByReceiptNumber(String receiptNumber);
}
