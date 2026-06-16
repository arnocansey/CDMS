package com.cdms.controller;

import com.cdms.entity.TwoFactorAuth;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.repository.UserRepository;
import com.cdms.security.TenantContext;
import com.cdms.service.TwoFactorAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/2fa")
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    public TwoFactorAuthController(TwoFactorAuthService twoFactorAuthService,
                                    UserRepository userRepository) {
        this.twoFactorAuthService = twoFactorAuthService;
        this.userRepository = userRepository;
    }

    @PostMapping("/setup")
    public ResponseEntity<Map<String, String>> setup() {
        Long userId = getCurrentUserId();
        String secret = twoFactorAuthService.generateSecret(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String qrCodeUri = twoFactorAuthService.getQrCodeUri(secret, user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("secret", secret);
        response.put("qrCodeUri", qrCodeUri);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/enable")
    public ResponseEntity<Map<String, String>> enable(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String code = body.get("code");
        twoFactorAuthService.enable(userId, code);

        Map<String, String> response = new HashMap<>();
        response.put("message", "2FA enabled successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/disable")
    public ResponseEntity<Map<String, String>> disable(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String password = body.get("password");
        twoFactorAuthService.disable(userId, password);

        Map<String, String> response = new HashMap<>();
        response.put("message", "2FA disabled successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String code = body.get("code");
        boolean valid = twoFactorAuthService.verifyCode(userId, code);

        Map<String, Object> response = new HashMap<>();
        response.put("valid", valid);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/backup-codes")
    public ResponseEntity<Map<String, Object>> generateBackupCodes() {
        Long userId = getCurrentUserId();
        List<String> codes = twoFactorAuthService.generateBackupCodes(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("backupCodes", codes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Long userId = getCurrentUserId();
        boolean isSetup = twoFactorAuthService.isSetup(userId);
        TwoFactorAuth tfa = twoFactorAuthService.getStatus(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("enabled", isSetup && tfa != null && tfa.isEnabled());
        response.put("setup", isSetup);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String) {
            String email = (String) auth.getPrincipal();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("User not found"))
                    .getId();
        }
        throw new BadRequestException("Not authenticated");
    }
}
