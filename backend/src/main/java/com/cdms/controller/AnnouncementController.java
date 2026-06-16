package com.cdms.controller;

import com.cdms.dto.AnnouncementDto;
import com.cdms.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        List<AnnouncementDto> announcements = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementDto>> getActiveAnnouncements() {
        List<AnnouncementDto> announcements = announcementService.getActiveAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementDto> getAnnouncementById(@PathVariable Long id) {
        AnnouncementDto announcement = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(announcement);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<AnnouncementDto> createAnnouncement(@Valid @RequestBody AnnouncementDto announcementDto) {
        AnnouncementDto announcement = announcementService.createAnnouncement(announcementDto);
        return ResponseEntity.ok(announcement);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<AnnouncementDto> updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementDto announcementDto) {
        AnnouncementDto announcement = announcementService.updateAnnouncement(id, announcementDto);
        return ResponseEntity.ok(announcement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok().build();
    }
}
