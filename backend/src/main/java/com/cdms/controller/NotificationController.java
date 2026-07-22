package com.cdms.controller;

import com.cdms.dto.NotificationDto;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.UserRepository;
import com.cdms.security.SecurityUtils;
import com.cdms.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        Long userId = resolveCurrentUserId();
        List<NotificationDto> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications() {
        Long userId = resolveCurrentUserId();
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = resolveCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        NotificationDto notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = resolveCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER', 'DEPARTMENT_LEADER')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerPushToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isBlank()) {
            throw new BadRequestException("token is required");
        }
        return ResponseEntity.ok(Map.of("message", "Push token registered successfully"));
    }

    private Long resolveCurrentUserId() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"))
                .getId();
    }
}
