package com.cdms.service;

import com.cdms.entity.Permission;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.PermissionRepository;
import com.cdms.repository.UserRepository;
import com.cdms.security.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PermissionService {

    private static final Map<String, Map<String, Map<String, Boolean>>> DEFAULT_PERMISSIONS = Map.of(
            "ADMIN", Map.of(
                    "donations", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "expenses", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "members", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "reports", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "budgets", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "events", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "attendance", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "departments", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "settings", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true)
            ),
            "PASTOR", Map.of(
                    "members", Map.of("view", true, "create", true, "edit", true, "delete", false, "approve", false),
                    "donations", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "expenses", Map.of("view", true, "create", true, "edit", true, "delete", false, "approve", false),
                    "reports", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "events", Map.of("view", true, "create", true, "edit", true, "delete", false, "approve", false),
                    "attendance", Map.of("view", true, "create", true, "edit", false, "delete", false, "approve", false),
                    "departments", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "budgets", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false)
            ),
            "TREASURER", Map.of(
                    "donations", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "expenses", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "budgets", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", true),
                    "members", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "reports", Map.of("view", true, "create", true, "edit", false, "delete", false, "approve", false),
                    "events", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "attendance", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "departments", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false)
            ),
            "DEPARTMENT_LEADER", Map.of(
                    "members", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "expenses", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "events", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "attendance", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "donations", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "budgets", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "reports", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false)
            ),
            "SECRETARY", Map.of(
                    "members", Map.of("view", true, "create", true, "edit", true, "delete", false, "approve", false),
                    "events", Map.of("view", true, "create", true, "edit", true, "delete", true, "approve", false),
                    "attendance", Map.of("view", true, "create", true, "edit", false, "delete", false, "approve", false),
                    "donations", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "expenses", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "budgets", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "reports", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false)
            ),
            "MEMBER", Map.of(
                    "donations", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "members", Map.of("view", false, "create", false, "edit", true, "delete", false, "approve", false),
                    "expenses", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "budgets", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "events", Map.of("view", true, "create", false, "edit", false, "delete", false, "approve", false),
                    "attendance", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false),
                    "reports", Map.of("view", false, "create", false, "edit", false, "delete", false, "approve", false)
            )
    );

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public PermissionService(PermissionRepository permissionRepository, UserRepository userRepository) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void initDefaultPermissions(Long churchId) {
        permissionRepository.deleteByChurchId(churchId);

        List<Permission> permissions = new ArrayList<>();
        for (Map.Entry<String, Map<String, Map<String, Boolean>>> roleEntry : DEFAULT_PERMISSIONS.entrySet()) {
            String role = roleEntry.getKey();
            for (Map.Entry<String, Map<String, Boolean>> resourceEntry : roleEntry.getValue().entrySet()) {
                String resource = resourceEntry.getKey();
                for (Map.Entry<String, Boolean> actionEntry : resourceEntry.getValue().entrySet()) {
                    String action = actionEntry.getKey();
                    boolean allowed = actionEntry.getValue();
                    permissions.add(new Permission(churchId, role, resource, action, allowed));
                }
            }
        }

        permissionRepository.saveAll(permissions);
    }

    public List<Permission> getPermissions(Long churchId, String role) {
        if (role == null) {
            return permissionRepository.findByChurchId(churchId);
        }
        return permissionRepository.findByChurchIdAndRole(churchId, role);
    }

    @Transactional
    public Permission updatePermission(Long churchId, String role, String resource, String action, boolean allowed) {
        Permission permission = permissionRepository
                .findByChurchIdAndRoleAndResourceAndAction(churchId, role, resource, action)
                .orElse(new Permission(churchId, role, resource, action, allowed));

        permission.setAllowed(allowed);
        return permissionRepository.save(permission);
    }

    public boolean hasPermission(Long churchId, String role, String resource, String action) {
        return permissionRepository
                .findByChurchIdAndRoleAndResourceAndAction(churchId, role, resource, action)
                .map(Permission::isAllowed)
                .orElse(false);
    }

    public boolean checkPermission(String resource, String action) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        Long churchId = TenantContext.getChurchId();
        if (churchId == null) {
            return false;
        }

        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name().replace("ROLE_", ""))
                .orElse("MEMBER");

        if ("ADMIN".equals(role)) {
            return true;
        }

        return hasPermission(churchId, role, resource, action);
    }
}
