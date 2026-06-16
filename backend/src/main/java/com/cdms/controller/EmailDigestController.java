package com.cdms.controller;

import com.cdms.entity.EmailDigest;
import com.cdms.security.TenantContext;
import com.cdms.service.EmailDigestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email-digest")
public class EmailDigestController {

    private final EmailDigestService emailDigestService;

    public EmailDigestController(EmailDigestService emailDigestService) {
        this.emailDigestService = emailDigestService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request) {
        Long churchId = TenantContext.getChurchId();
        String email = request.get("email");
        String name = request.get("name");
        String type = request.get("type");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (type == null || type.isBlank()) {
            type = "WEEKLY";
        }

        emailDigestService.subscribe(churchId, email, name, type);
        return ResponseEntity.ok(Map.of("message", "Subscribed to " + type + " digest successfully"));
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        Long churchId = TenantContext.getChurchId();
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        emailDigestService.unsubscribe(churchId, email);
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDigestStats() {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> stats = emailDigestService.getDigestStats(churchId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/send/{type}")
    public ResponseEntity<Map<String, String>> sendDigests(@PathVariable String type) {
        emailDigestService.sendDigests(type);
        return ResponseEntity.ok(Map.of("message", type + " digest send triggered successfully"));
    }
}
