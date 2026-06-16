package com.cdms.repository;

import com.cdms.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findByChurchId(Long churchId);

    List<Visitor> findByChurchIdAndVisitDateBetween(Long churchId, LocalDate from, LocalDate to);

    List<Visitor> findByChurchIdAndStatus(Long churchId, String status);

    List<Visitor> findByChurchIdAndFollowUpStatus(Long churchId, String followUpStatus);

    long countByChurchIdAndVisitDateBetween(Long churchId, LocalDate from, LocalDate to);

    Optional<Visitor> findByChurchIdAndEmail(Long churchId, String email);

    @Query("SELECT v FROM Visitor v WHERE v.churchId = :churchId AND v.visitCount > 1")
    List<Visitor> findReturningVisitorsByChurchId(@Param("churchId") Long churchId);
}
