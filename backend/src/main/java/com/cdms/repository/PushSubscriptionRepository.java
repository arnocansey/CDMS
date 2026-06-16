package com.cdms.repository;

import com.cdms.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserIdAndActive(Long userId, boolean active);
    List<PushSubscription> findByChurchIdAndActive(Long churchId, boolean active);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
