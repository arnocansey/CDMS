package com.cdms.repository;

import com.cdms.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByChurchId(Long churchId);
    Optional<ApiKey> findByApiKey(String apiKey);
    List<ApiKey> findByChurchIdAndActive(Long churchId, boolean active);
}
