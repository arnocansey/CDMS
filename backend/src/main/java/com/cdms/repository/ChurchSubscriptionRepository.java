package com.cdms.repository;

import com.cdms.entity.ChurchSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChurchSubscriptionRepository extends JpaRepository<ChurchSubscription, Long> {
    Optional<ChurchSubscription> findByChurchIdAndStatus(Long churchId, String status);
    List<ChurchSubscription> findAllByChurchId(Long churchId);
}
