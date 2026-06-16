package com.cdms.repository;

import com.cdms.entity.RecurringDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringDonationRepository extends JpaRepository<RecurringDonation, Long> {
    List<RecurringDonation> findByChurchIdAndActive(Long churchId, boolean active);
    List<RecurringDonation> findByChurchIdAndNextDueDateBetween(Long churchId, LocalDate start, LocalDate end);
    List<RecurringDonation> findByActiveAndNextDueDateBetween(boolean active, LocalDate start, LocalDate end);
}
