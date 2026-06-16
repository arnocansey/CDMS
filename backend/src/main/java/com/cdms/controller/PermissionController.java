package com.cdms.controller;

import com.cdms.entity.Permission;
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
        Long churchId = TenantContext.getChurchId();
        List<Permission> permissions = permissionService.getPermissions(churchId, null);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Permission>> getPermissionsForRole(@PathVariable String role) {
        Long churchId = TenantContext.getChurchId();
        List<Permission> permissions = permissionService.getPermissions(churchId, role);
        return ResponseEntity.ok(permissions);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> updatePermission(@RequestBody Map<String, Object> body) {
        Long churchId = TenantContext.getChurchId();
        String role = (String) body.get("role");
        String resource = (String) body.get("resource");
        String action = (String) body.get("action");
        boolean allowed = (boolean) body.get("allowed");

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
        Long churchId = TenantContext.getChurchId();
        permissionService.initDefaultPermissions(churchId);
        return ResponseEntity.ok(Map.of("message", "Default permissions initialized successfully"));
    }
}
