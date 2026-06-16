package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "two_factor_auth")
public class TwoFactorAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "secret_key", nullable = false)
    private String secretKey;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(name = "backup_codes", columnDefinition = "TEXT")
    private String backupCodes;

    @Column(name = "last_used_code", length = 10)
    private String lastUsedCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public TwoFactorAuth() {}

    public TwoFactorAuth(Long userId, String secretKey) {
        this.userId = userId;
        this.secretKey = secretKey;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getBackupCodes() { return backupCodes; }
    public void setBackupCodes(String backupCodes) { this.backupCodes = backupCodes; }
    public String getLastUsedCode() { return lastUsedCode; }
    public void setLastUsedCode(String lastUsedCode) { this.lastUsedCode = lastUsedCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
