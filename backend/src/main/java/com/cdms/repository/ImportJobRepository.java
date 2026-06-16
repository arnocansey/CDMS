package com.cdms.repository;

import com.cdms.entity.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportJobRepository extends JpaRepository<ImportJob, Long> {
    List<ImportJob> findByChurchId(Long churchId);
    List<ImportJob> findByChurchIdAndStatus(Long churchId, String status);
}
