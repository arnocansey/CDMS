package com.cdms.repository;

import com.cdms.entity.DonorRetention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorRetentionRepository extends JpaRepository<DonorRetention, Long> {
    List<DonorRetention> findByChurchIdAndPeriod(Long churchId, String period);

    List<DonorRetention> findByChurchIdAndRetentionStatus(Long churchId, String retentionStatus);

    List<DonorRetention> findByMemberIdAndPeriod(Long memberId, String period);
}
