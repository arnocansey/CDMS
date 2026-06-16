package com.cdms.repository;

import com.cdms.entity.ChurchRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChurchRegistrationRequestRepository extends JpaRepository<ChurchRegistrationRequest, Long> {
    List<ChurchRegistrationRequest> findByStatus(String status);
    Optional<ChurchRegistrationRequest> findByRequesterEmail(String email);
}
