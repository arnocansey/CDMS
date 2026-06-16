package com.cdms.repository;

import com.cdms.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByPaystackReference(String reference);
    List<PaymentTransaction> findByChurchIdOrderByCreatedAtDesc(Long churchId);
    List<PaymentTransaction> findByChurchIdAndStatusOrderByCreatedAtDesc(Long churchId, String status);
    Optional<PaymentTransaction> findByChurchIdAndPlanIdAndStatus(Long churchId, Long planId, String status);
}
