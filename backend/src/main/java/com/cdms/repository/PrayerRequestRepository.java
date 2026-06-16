package com.cdms.repository;

import com.cdms.entity.PrayerRequest;
import com.cdms.entity.PrayerRequest.PrayerRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrayerRequestRepository extends JpaRepository<PrayerRequest, Long> {
    List<PrayerRequest> findByStatus(PrayerRequestStatus status);
    List<PrayerRequest> findByMemberId(Long memberId);
    List<PrayerRequest> findByAnonymousFalseOrderByCreatedAtDesc();
    long countByStatus(PrayerRequestStatus status);
}
