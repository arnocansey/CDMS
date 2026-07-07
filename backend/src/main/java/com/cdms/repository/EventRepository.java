package com.cdms.repository;

import com.cdms.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByEventDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Event e WHERE e.eventDate >= :date ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("date") LocalDate date);
    
    @Query("SELECT e FROM Event e WHERE e.title LIKE LOWER(CONCAT('%', :search, '%')) OR e.description LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Event> searchEvents(@Param("search") String search);

    @Query("SELECT e FROM Event e WHERE e.churchId = :churchId AND e.eventDate >= :date ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEventsByChurchId(@Param("churchId") Long churchId, @Param("date") LocalDate date);

    List<Event> findByChurchId(Long churchId);
}
