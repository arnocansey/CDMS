package com.cdms.repository;

import com.cdms.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, Long> {
    List<FundTransaction> findByFundId(Long fundId);
    List<FundTransaction> findByFundIdAndTransactionDateBetween(Long fundId, LocalDate startDate, LocalDate endDate);
    List<FundTransaction> findByTransactionDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FundTransaction ft WHERE ft.fund.id = :fundId AND ft.transactionType = :transactionType")
    BigDecimal sumByFundIdAndTransactionType(@Param("fundId") Long fundId, @Param("transactionType") String transactionType);
}
