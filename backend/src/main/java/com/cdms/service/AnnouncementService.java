package com.cdms.service;

import com.cdms.dto.AnnouncementDto;
import com.cdms.entity.Announcement;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<AnnouncementDto> getAllAnnouncements() {
        Long churchId = TenantContext.requireChurchId();
        return announcementRepository.findByChurchId(churchId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AnnouncementDto> getActiveAnnouncements() {
        Long churchId = TenantContext.requireChurchId();
        return announcementRepository.findActiveAnnouncementsByChurchId(churchId, LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AnnouncementDto getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !announcement.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Announcement", id);
        }
        return mapToDto(announcement);
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto announcementDto) {
        Announcement announcement = new Announcement();
        announcement.setChurchId(TenantContext.getChurchId());
        announcement.setTitle(announcementDto.getTitle());
        announcement.setContent(announcementDto.getContent());
        announcement.setPublishDate(announcementDto.getPublishDate() != null ? announcementDto.getPublishDate() : LocalDate.now());
        announcement.setExpiryDate(announcementDto.getExpiryDate());
        announcement.setPublished(announcementDto.isPublished());
        announcement.setCreatedBy(announcementDto.getCreatedBy());

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return mapToDto(savedAnnouncement);
    }

    @Transactional
    public AnnouncementDto updateAnnouncement(Long id, AnnouncementDto announcementDto) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));

        announcement.setTitle(announcementDto.getTitle());
        announcement.setContent(announcementDto.getContent());
        announcement.setPublishDate(announcementDto.getPublishDate());
        announcement.setExpiryDate(announcementDto.getExpiryDate());
        announcement.setPublished(announcementDto.isPublished());

        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        return mapToDto(updatedAnnouncement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        announcementRepository.delete(announcement);
    }

    private AnnouncementDto mapToDto(Announcement announcement) {
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setContent(announcement.getContent());
        dto.setPublishDate(announcement.getPublishDate());
        dto.setExpiryDate(announcement.getExpiryDate());
        dto.setPublished(announcement.isPublished());
        dto.setCreatedBy(announcement.getCreatedBy());
        return dto;
    }
}
