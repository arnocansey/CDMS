package com.cdms.controller;

import com.cdms.entity.ApiKey;
import com.cdms.security.TenantContext;
import com.cdms.service.ApiKeyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/api-keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<Map<String, Object>> generateApiKey(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.getChurchId();
        
        String keyName = (String) body.get("keyName");
        if (keyName == null) {
            keyName = (String) body.get("name");
        }
        
        String permissions = "";
        Object permObj = body.get("permissions");
        if (permObj instanceof String) {
            permissions = (String) permObj;
        } else if (permObj instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> permList = (List<String>) permObj;
            permissions = String.join(",", permList);
        }
        
        Integer rateLimit = body.get("rateLimit") != null ? (Integer) body.get("rateLimit") : null;
        Integer expiryDays = body.get("expiryDays") != null ? (Integer) body.get("expiryDays") : null;
        
        ApiKey apiKey = apiKeyService.generateApiKey(churchId, keyName, permissions, rateLimit, expiryDays);
        return ResponseEntity.ok(mapToFrontend(apiKey));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<List<Map<String, Object>>> getApiKeys() {
        Long churchId = TenantContext.getChurchId();
        List<Map<String, Object>> keys = apiKeyService.getApiKeys(churchId).stream()
                .map(this::mapToFrontend)
                .collect(Collectors.toList());
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
    public ResponseEntity<Map<String, Object>> regenerateKeys(@PathVariable Long id) {
        ApiKey apiKey = apiKeyService.regenerateKeys(id);
        return ResponseEntity.ok(mapToFrontend(apiKey));
    }

    private Map<String, Object> mapToFrontend(ApiKey key) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", key.getId());
        map.put("name", key.getKeyName());
        
        String prefix = key.getApiKey();
        if (prefix != null && prefix.length() > 8) {
            prefix = prefix.substring(0, 8);
        }
        map.put("keyPrefix", prefix);
        map.put("key", key.getApiKey());
        
        List<String> permList = new java.util.ArrayList<>();
        if (key.getPermissions() != null && !key.getPermissions().isEmpty()) {
            permList = Arrays.stream(key.getPermissions().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
        }
        map.put("permissions", permList);
        map.put("usageCount", key.getUsageCount());
        map.put("rateLimit", key.getRateLimit());
        
        String status = "ACTIVE";
        if (!key.isActive()) {
            status = "REVOKED";
        } else if (key.getExpiresAt() != null && key.getExpiresAt().isBefore(LocalDate.now())) {
            status = "EXPIRED";
        }
        map.put("status", status);
        map.put("expiresAt", key.getExpiresAt() != null ? key.getExpiresAt().toString() : null);
        map.put("createdAt", key.getCreatedAt() != null ? key.getCreatedAt().toString() : null);
        
        return map;
    }
}
