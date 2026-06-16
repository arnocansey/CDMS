package com.cdms.repository;

import com.cdms.entity.PledgePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PledgePaymentRepository extends JpaRepository<PledgePayment, Long> {
    List<PledgePayment> findByPledgeId(Long pledgeId);
    List<PledgePayment> findByPledgeIdOrderByPaymentDateDesc(Long pledgeId);
    List<PledgePayment> findByChurchId(Long churchId);
}
