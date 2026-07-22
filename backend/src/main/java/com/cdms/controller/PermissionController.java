package com.cdms.controller;

import com.cdms.entity.Permission;
import com.cdms.exception.BadRequestException;
import com.cdms.security.TenantContext;
import com.cdms.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        Long churchId = TenantContext.requireChurchId();
        List<Permission> permissions = permissionService.getPermissions(churchId, null);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Permission>> getPermissionsForRole(@PathVariable String role) {
        Long churchId = TenantContext.requireChurchId();
        List<Permission> permissions = permissionService.getPermissionsForRoleOrDefaults(churchId, role);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Accepts either:
     * <ul>
     *   <li>Bulk: {@code { "role": "PASTOR", "permissions": { "members": { "view": true, ... } } }}</li>
     *   <li>Single: {@code { "role", "resource", "action", "allowed" }}</li>
     * </ul>
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePermission(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.requireChurchId();
        String role = body.get("role") != null ? body.get("role").toString() : null;
        if (role == null || role.isBlank()) {
            throw new BadRequestException("role is required");
        }
        if ("ADMIN".equalsIgnoreCase(role)) {
            throw new BadRequestException("ADMIN permissions cannot be modified");
        }

        Object permissionsObj = body.get("permissions");
        if (permissionsObj instanceof Map<?, ?> permissionsMap) {
            @SuppressWarnings("unchecked")
            Map<String, Object> permissions = (Map<String, Object>) permissionsMap;
            List<Permission> updated = permissionService.updateRolePermissions(churchId, role, permissions);
            return ResponseEntity.ok(updated);
        }

        String resource = body.get("resource") != null ? body.get("resource").toString() : null;
        String action = body.get("action") != null ? body.get("action").toString() : null;
        if (resource == null || action == null || !body.containsKey("allowed")) {
            throw new BadRequestException("Provide either permissions map, or resource/action/allowed");
        }
        boolean allowed = Boolean.TRUE.equals(body.get("allowed"))
                || "true".equalsIgnoreCase(String.valueOf(body.get("allowed")));

        Permission permission = permissionService.updatePermission(churchId, role, resource, action, allowed);
        return ResponseEntity.ok(permission);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @RequestParam String resource,
            @RequestParam String action) {
        boolean hasPermission = permissionService.checkPermission(resource, action);
        return ResponseEntity.ok(Map.of("allowed", hasPermission));
    }

    @PostMapping("/init")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> initDefaultPermissions() {
        Long churchId = TenantContext.requireChurchId();
        permissionService.initDefaultPermissions(churchId);
        return ResponseEntity.ok(Map.of("message", "Default permissions initialized successfully"));
    }
}
