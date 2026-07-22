package com.cdms.controller;

import com.cdms.exception.BadRequestException;
import com.cdms.repository.UserRepository;
import com.cdms.security.SecurityUtils;
import com.cdms.service.PushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push-notifications")
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;
    private final UserRepository userRepository;

    public PushNotificationController(PushNotificationService pushNotificationService,
                                      UserRepository userRepository) {
        this.pushNotificationService = pushNotificationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY')")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request) {
        Long userId = resolveCurrentUserId();
        String endpoint = request.get("endpoint");
        String p256dh = request.get("p256dh");
        String auth = request.get("auth");

        if (endpoint == null || endpoint.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Endpoint is required"));
        }
        if (p256dh == null || p256dh.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "p256dh key is required"));
        }
        if (auth == null || auth.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "auth key is required"));
        }

        String userAgent = request.getOrDefault("userAgent", "");
        pushNotificationService.registerSubscription(userId, endpoint, p256dh, auth, userAgent);
        return ResponseEntity.ok(Map.of("message", "Push subscription registered successfully"));
    }

    @DeleteMapping("/unsubscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY')")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        String endpoint = request.get("endpoint");

        if (endpoint == null || endpoint.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Endpoint is required"));
        }

        pushNotificationService.unregister(endpoint);
        return ResponseEntity.ok(Map.of("message", "Push subscription unregistered successfully"));
    }

    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY')")
    public ResponseEntity<Map<String, String>> sendTestNotification() {
        Long userId = resolveCurrentUserId();
        pushNotificationService.sendNotification(userId, "Test Notification",
                "This is a test push notification from CDMS", "/dashboard");
        return ResponseEntity.ok(Map.of("message", "Test notification sent"));
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
