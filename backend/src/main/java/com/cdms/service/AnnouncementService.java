package com.cdms.service;

import com.cdms.dto.AnnouncementDto;
import com.cdms.entity.Announcement;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

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
        return announcementRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AnnouncementDto> getActiveAnnouncements() {
        return announcementRepository.findActiveAnnouncements(LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AnnouncementDto getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        return mapToDto(announcement);
    }

    public AnnouncementDto createAnnouncement(AnnouncementDto announcementDto) {
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDto.getTitle());
        announcement.setContent(announcementDto.getContent());
        announcement.setPublishDate(announcementDto.getPublishDate() != null ? announcementDto.getPublishDate() : LocalDate.now());
        announcement.setExpiryDate(announcementDto.getExpiryDate());
        announcement.setPublished(announcementDto.isPublished());
        announcement.setCreatedBy(announcementDto.getCreatedBy());

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return mapToDto(savedAnnouncement);
    }

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
