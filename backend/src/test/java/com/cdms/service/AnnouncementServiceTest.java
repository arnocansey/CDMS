package com.cdms.service;

import com.cdms.dto.AnnouncementDto;
import com.cdms.entity.Announcement;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.AnnouncementRepository;
import com.cdms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @InjectMocks
    private AnnouncementService announcementService;

    private Announcement announcement;

    @BeforeEach
    void setUp() {
        TenantContext.setChurchId(1L);

        announcement = new Announcement();
        announcement.setId(1L);
        announcement.setChurchId(1L);
        announcement.setTitle("Church Service Update");
        announcement.setContent("This Sunday we have a special service.");
        announcement.setPublishDate(LocalDate.now());
        announcement.setPublished(true);
        announcement.setCreatedBy("Pastor Smith");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getAllAnnouncements_Success() {
        when(announcementRepository.findByChurchId(1L)).thenReturn(Arrays.asList(announcement));

        List<AnnouncementDto> result = announcementService.getAllAnnouncements();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Church Service Update");
    }

    @Test
    void getAllAnnouncements_NoChurchContext_ThrowsBadRequest() {
        TenantContext.clear();

        assertThatThrownBy(() -> announcementService.getAllAnnouncements())
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No church context set");
    }

    @Test
    void getActiveAnnouncements_Success() {
        when(announcementRepository.findActiveAnnouncementsByChurchId(1L, LocalDate.now()))
                .thenReturn(Arrays.asList(announcement));

        List<AnnouncementDto> result = announcementService.getActiveAnnouncements();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Church Service Update");
    }

    @Test
    void getAnnouncementById_Success() {
        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));

        AnnouncementDto result = announcementService.getAnnouncementById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Church Service Update");
    }

    @Test
    void getAnnouncementById_NotFound_ThrowsException() {
        when(announcementRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> announcementService.getAnnouncementById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Announcement not found with id: 999");
    }

    @Test
    void createAnnouncement_Success() {
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);

        AnnouncementDto dto = new AnnouncementDto();
        dto.setTitle("Church Service Update");
        dto.setContent("This Sunday we have a special service.");
        dto.setPublished(true);
        dto.setCreatedBy("Pastor Smith");

        AnnouncementDto result = announcementService.createAnnouncement(dto);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Church Service Update");
        verify(announcementRepository, times(1)).save(any(Announcement.class));
    }

    @Test
    void updateAnnouncement_Success() {
        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);

        AnnouncementDto dto = new AnnouncementDto();
        dto.setTitle("Updated Announcement");
        dto.setContent("Updated content");

        AnnouncementDto result = announcementService.updateAnnouncement(1L, dto);

        assertThat(result).isNotNull();
        verify(announcementRepository, times(1)).save(any(Announcement.class));
    }

    @Test
    void updateAnnouncement_NotFound_ThrowsException() {
        when(announcementRepository.findById(999L)).thenReturn(Optional.empty());

        AnnouncementDto dto = new AnnouncementDto();
        dto.setTitle("Updated");

        assertThatThrownBy(() -> announcementService.updateAnnouncement(999L, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Announcement not found with id: 999");
    }

    @Test
    void deleteAnnouncement_Success() {
        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));

        announcementService.deleteAnnouncement(1L);

        verify(announcementRepository, times(1)).delete(announcement);
    }

    @Test
    void deleteAnnouncement_NotFound_ThrowsException() {
        when(announcementRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> announcementService.deleteAnnouncement(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Announcement not found with id: 999");
    }
}
