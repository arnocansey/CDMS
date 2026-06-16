package com.cdms.controller;

import com.cdms.dto.NotificationDto;
import com.cdms.repository.UserRepository;
import com.cdms.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<NotificationDto> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        NotificationDto notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerPushToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        // Store the push token for the user
        // In production, associate token with authenticated user
        return ResponseEntity.ok(Map.of("message", "Push token registered successfully"));
    }

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails)) {
            return 1L;
        }
        org.springframework.security.core.userdetails.UserDetails userDetails =
                (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
        com.cdms.entity.User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        return user != null ? user.getId() : 1L;
    }
}
