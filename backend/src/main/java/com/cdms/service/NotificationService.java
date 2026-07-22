package com.cdms.service;

import com.cdms.dto.NotificationDto;
import com.cdms.entity.Notification;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.NotificationRepository;
import com.cdms.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDto> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public NotificationDto createNotification(Long churchId, Long userId, String title, String message, String type) {
        Long resolvedChurchId = churchId != null ? churchId : TenantContext.getChurchId();
        if (resolvedChurchId == null) {
            throw new BadRequestException("No church context set for notification");
        }
        Notification notification = new Notification(userId, title, message, type);
        notification.setChurchId(resolvedChurchId);
        Notification savedNotification = notificationRepository.save(notification);
        return mapToDto(savedNotification);
    }

    @Transactional
    public NotificationDto createNotification(Long userId, String title, String message, String type) {
        return createNotification(TenantContext.getChurchId(), userId, title, message, type);
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToDto(updatedNotification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadByUserId(userId);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notificationRepository.delete(notification);
    }

    public void notifyDigestReady(Long churchId, String type) {
        if (churchId == null || type == null) {
            return;
        }
        boolean alreadyNotified = notificationRepository.findByChurchIdAndType(churchId, "DIGEST").stream()
                .anyMatch(n -> n.getMessage() != null && n.getMessage().contains(type));
        if (alreadyNotified) {
            return;
        }
        // Church-scoped system notice without a fake user id (user_id required by schema)
        Notification notification = new Notification(0L, type + " Digest Ready",
                "Your " + type.toLowerCase() + " digest has been generated and sent to subscribers.",
                "DIGEST");
        notification.setChurchId(churchId);
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
