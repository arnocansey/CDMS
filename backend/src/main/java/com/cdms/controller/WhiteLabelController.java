package com.cdms.controller;

import com.cdms.security.TenantContext;
import com.cdms.service.WhiteLabelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/white-label")
public class WhiteLabelController {

    private final WhiteLabelService whiteLabelService;

    public WhiteLabelController(WhiteLabelService whiteLabelService) {
        this.whiteLabelService = whiteLabelService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> getBranding() {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> branding = whiteLabelService.getBranding(churchId);
        return ResponseEntity.ok(branding);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateBranding(@RequestBody Map<String, Object> updates) {
        Long churchId = TenantContext.getChurchId();
        Map<String, Object> branding = whiteLabelService.updateBranding(churchId, updates);
        return ResponseEntity.ok(branding);
    }

    @GetMapping("/css")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<String> getBrandingCSS() {
        Long churchId = TenantContext.getChurchId();
        String css = whiteLabelService.getBrandingCSS(churchId);
        return ResponseEntity.ok().header("Content-Type", "text/css").body(css);
    }

    @GetMapping("/public/{churchId}")
    public ResponseEntity<Map<String, Object>> getPublicBranding(@PathVariable Long churchId) {
        Map<String, Object> branding = whiteLabelService.getPublicBranding(churchId);
        return ResponseEntity.ok(branding);
    }

    @PostMapping("/logo-dark")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadDarkLogo(@RequestParam("file") MultipartFile file) throws IOException {
        Long churchId = TenantContext.requireChurchId();
        String url = whiteLabelService.uploadDarkLogo(churchId, file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/logo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        Long churchId = TenantContext.requireChurchId();
        String url = whiteLabelService.uploadLogo(churchId, file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
