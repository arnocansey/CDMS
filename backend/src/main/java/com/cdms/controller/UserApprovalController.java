package com.cdms.controller;

import com.cdms.dto.UserDto;
import com.cdms.entity.Church;
import com.cdms.entity.ChurchRegistrationRequest;
import com.cdms.security.JwtTokenProvider;
import com.cdms.security.TenantContext;
import com.cdms.service.UserApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
public class UserApprovalController {

    private final UserApprovalService userApprovalService;
    private final JwtTokenProvider tokenProvider;

    public UserApprovalController(UserApprovalService userApprovalService, JwtTokenProvider tokenProvider) {
        this.userApprovalService = userApprovalService;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping("/pending-users")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<List<UserDto>> getPendingUsers() {
        Long churchId = TenantContext.getChurchId();
        List<UserDto> pendingUsers = userApprovalService.getPendingUsers(churchId);
        return ResponseEntity.ok(pendingUsers);
    }

    @PostMapping("/users/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<UserDto> approveUser(@PathVariable Long id) {
        UserDto approvedUser = userApprovalService.approveUser(id);
        return ResponseEntity.ok(approvedUser);
    }

    @PostMapping("/users/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<UserDto> rejectUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "");
        UserDto rejectedUser = userApprovalService.rejectUser(id, reason);
        return ResponseEntity.ok(rejectedUser);
    }

    @GetMapping("/church-requests")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<ChurchRegistrationRequest>> getPendingChurchRequests() {
        List<ChurchRegistrationRequest> requests = userApprovalService.getPendingChurchRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/church-requests/{id}/approve")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Church> approveChurchRequest(@PathVariable Long id) {
        Church church = userApprovalService.approveChurchRequest(id);
        return ResponseEntity.ok(church);
    }

    @PostMapping("/church-requests/{id}/reject")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> rejectChurchRequest(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "");
        userApprovalService.rejectChurchRequest(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/churches/search")
    public ResponseEntity<List<Church>> searchChurches(@RequestParam(required = false) String query) {
        List<Church> churches = userApprovalService.searchChurches(query);
        return ResponseEntity.ok(churches);
    }
}
