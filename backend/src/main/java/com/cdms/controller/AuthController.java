package com.cdms.controller;

import com.cdms.dto.*;
import com.cdms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        String email = authentication.getName();
        authService.logout(email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserDto user = authService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}
