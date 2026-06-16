package com.cdms.repository;

import com.cdms.entity.BankReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BankReconciliationRepository extends JpaRepository<BankReconciliation, Long> {
    List<BankReconciliation> findByChurchId(Long churchId);
    List<BankReconciliation> findByChurchIdAndStatus(Long churchId, String status);
}
