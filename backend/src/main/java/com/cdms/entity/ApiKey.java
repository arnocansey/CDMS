package com.cdms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys")
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "church_id", nullable = false)
    private Long churchId;

    @Column(name = "key_name", nullable = false, length = 100)
    private String keyName;

    @Column(name = "api_key", nullable = false, unique = true, length = 36)
    private String apiKey;

    @Column(name = "secret_key", nullable = false, length = 36)
    private String secretKey;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "last_used_at")
    private LocalDate lastUsedAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    private String permissions;

    @Column(name = "rate_limit", nullable = false)
    private Integer rateLimit = 1000;

    @Column(name = "usage_count")
    private Long usageCount = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ApiKey() {}

    public ApiKey(Long churchId, String keyName, String apiKey, String secretKey) {
        this.churchId = churchId;
        this.keyName = keyName;
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getChurchId() { return churchId; }
    public void setChurchId(Long churchId) { this.churchId = churchId; }
    public String getKeyName() { return keyName; }
    public void setKeyName(String keyName) { this.keyName = keyName; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDate getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(LocalDate lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public LocalDate getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDate expiresAt) { this.expiresAt = expiresAt; }
    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
    public Integer getRateLimit() { return rateLimit; }
    public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }
    public Long getUsageCount() { return usageCount; }
    public void setUsageCount(Long usageCount) { this.usageCount = usageCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
