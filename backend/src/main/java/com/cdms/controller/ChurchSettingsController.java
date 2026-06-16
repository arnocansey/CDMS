package com.cdms.controller;

import com.cdms.entity.Church;
import com.cdms.security.TenantContext;
import com.cdms.service.ChurchSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/church-settings")
public class ChurchSettingsController {

    private final ChurchSettingsService churchSettingsService;

    public ChurchSettingsController(ChurchSettingsService churchSettingsService) {
        this.churchSettingsService = churchSettingsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Church> getChurchSettings() {
        Long churchId = TenantContext.getChurchId();
        Church church = churchSettingsService.getChurchSettings(churchId);
        return ResponseEntity.ok(church);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Church> updateChurchSettings(@RequestBody Map<String, Object> updates) {
        Long churchId = TenantContext.getChurchId();
        Church church = churchSettingsService.updateChurchSettings(churchId, updates);
        return ResponseEntity.ok(church);
    }

    @PostMapping("/logo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Church> uploadLogo(@RequestParam("file") MultipartFile file) {
        Long churchId = TenantContext.getChurchId();
        Church church = churchSettingsService.uploadLogo(churchId, file);
        return ResponseEntity.ok(church);
    }

    @GetMapping("/public/{churchId}")
    public ResponseEntity<Church> getPublicChurchInfo(@PathVariable Long churchId) {
        Church church = churchSettingsService.getPublicChurchInfo(churchId);
        return ResponseEntity.ok(church);
    }
}
