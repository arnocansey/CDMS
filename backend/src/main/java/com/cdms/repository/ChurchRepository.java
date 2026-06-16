package com.cdms.repository;

import com.cdms.entity.Church;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChurchRepository extends JpaRepository<Church, Long> {
    Optional<Church> findBySlug(String slug);
    Optional<Church> findByEmail(String email);
}
