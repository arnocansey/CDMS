package com.cdms.controller;

import com.cdms.dto.EventDto;
import com.cdms.service.EventService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        List<EventDto> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDto>> getUpcomingEvents() {
        List<EventDto> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/range")
    public ResponseEntity<List<EventDto>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<EventDto> events = eventService.getEventsByDateRange(startDate, endDate);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto) {
        EventDto event = eventService.createEvent(eventDto);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto eventDto) {
        EventDto event = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }
}
