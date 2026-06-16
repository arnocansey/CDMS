package com.cdms.controller;

import com.cdms.entity.ApiKey;
import com.cdms.security.TenantContext;
import com.cdms.service.ApiKeyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/api-keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<ApiKey> generateApiKey(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.getChurchId();
        String keyName = (String) body.get("keyName");
        String permissions = (String) body.get("permissions");
        Integer rateLimit = body.get("rateLimit") != null ? (Integer) body.get("rateLimit") : null;
        Integer expiryDays = body.get("expiryDays") != null ? (Integer) body.get("expiryDays") : null;
        ApiKey apiKey = apiKeyService.generateApiKey(churchId, keyName, permissions, rateLimit, expiryDays);
        return ResponseEntity.ok(apiKey);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<ApiKey>> getApiKeys() {
        Long churchId = TenantContext.getChurchId();
        List<ApiKey> keys = apiKeyService.getApiKeys(churchId);
        return ResponseEntity.ok(keys);
    }

    @PutMapping("/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revokeApiKey(@PathVariable Long id) {
        apiKeyService.revokeApiKey(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiKey> regenerateKeys(@PathVariable Long id) {
        ApiKey apiKey = apiKeyService.regenerateKeys(id);
        return ResponseEntity.ok(apiKey);
    }
}
