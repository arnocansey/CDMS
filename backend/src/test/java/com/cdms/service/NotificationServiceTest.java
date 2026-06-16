package com.cdms.service;

import com.cdms.dto.NotificationDto;
import com.cdms.entity.Notification;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = new Notification(1L, "New Announcement", "There is a new church announcement.", "ANNOUNCEMENT");
        notification.setId(1L);
    }

    @Test
    void getNotificationsByUserId_ReturnsList() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Arrays.asList(notification));

        List<NotificationDto> result = notificationService.getNotificationsByUserId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("New Announcement");
    }

    @Test
    void getUnreadNotifications_ReturnsList() {
        when(notificationRepository.findUnreadByUserId(1L))
                .thenReturn(Arrays.asList(notification));

        List<NotificationDto> result = notificationService.getUnreadNotifications(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isRead()).isFalse();
    }

    @Test
    void getUnreadCount_ReturnsCount() {
        when(notificationRepository.countUnreadByUserId(1L)).thenReturn(5L);

        long result = notificationService.getUnreadCount(1L);

        assertThat(result).isEqualTo(5L);
    }

    @Test
    void createNotification_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDto result = notificationService.createNotification(1L, "New Announcement",
                "There is a new church announcement.", "ANNOUNCEMENT");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("New Announcement");
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDto result = notificationService.markAsRead(1L);

        assertThat(result).isNotNull();
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found with id: 999");
    }

    @Test
    void markAllAsRead_Success() {
        when(notificationRepository.findUnreadByUserId(1L))
                .thenReturn(Arrays.asList(notification));
        when(notificationRepository.saveAll(any())).thenReturn(Arrays.asList(notification));

        notificationService.markAllAsRead(1L);

        verify(notificationRepository, times(1)).saveAll(any());
    }

    @Test
    void deleteNotification_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.deleteNotification(1L);

        verify(notificationRepository, times(1)).delete(notification);
    }

    @Test
    void deleteNotification_NotFound_ThrowsException() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.deleteNotification(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found with id: 999");
    }
}
