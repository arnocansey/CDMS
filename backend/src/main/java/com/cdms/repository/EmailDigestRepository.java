package com.cdms.repository;

import com.cdms.entity.EmailDigest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailDigestRepository extends JpaRepository<EmailDigest, Long> {
    List<EmailDigest> findByChurchIdAndActive(Long churchId, boolean active);
    List<EmailDigest> findByChurchIdAndDigestType(Long churchId, String type);
    Optional<EmailDigest> findByChurchIdAndRecipientEmailAndActive(Long churchId, String recipientEmail, boolean active);
    Optional<EmailDigest> findByChurchIdAndRecipientEmail(Long churchId, String recipientEmail);
    long countByChurchIdAndActive(Long churchId, boolean active);
}
