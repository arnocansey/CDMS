package com.cdms.repository;

import com.cdms.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByPublishedTrueOrderByCreatedAtDesc();
    
    @Query("SELECT a FROM Announcement a WHERE a.published = true AND (a.expiryDate IS NULL OR a.expiryDate >= :date)")
    List<Announcement> findActiveAnnouncements(@Param("date") LocalDate date);
    
    List<Announcement> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT a FROM Announcement a WHERE a.churchId = :churchId AND a.published = true AND (a.expiryDate IS NULL OR a.expiryDate >= :date)")
    List<Announcement> findActiveAnnouncementsByChurchId(@Param("churchId") Long churchId, @Param("date") LocalDate date);
}
