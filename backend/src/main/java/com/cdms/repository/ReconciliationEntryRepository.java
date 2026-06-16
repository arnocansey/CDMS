package com.cdms.repository;

import com.cdms.entity.ReconciliationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReconciliationEntryRepository extends JpaRepository<ReconciliationEntry, Long> {
    List<ReconciliationEntry> findByReconciliationId(Long reconciliationId);
}
