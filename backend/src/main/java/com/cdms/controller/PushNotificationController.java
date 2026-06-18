package com.cdms.controller;

import com.cdms.security.TenantContext;
import com.cdms.service.PushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push-notifications")
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    public PushNotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY')")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request,
                                                         Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
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
    public ResponseEntity<Map<String, String>> sendTestNotification(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        pushNotificationService.sendNotification(userId, "Test Notification",
                "This is a test push notification from " + appName(), "/dashboard");
        return ResponseEntity.ok(Map.of("message", "Test notification sent"));
    }

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null) {
            return 1L;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return 1L;
    }

    private String appName() {
        return "Church Financial Management System";
    }
}
