package com.cdms.service;

import com.cdms.entity.ApiKey;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ApiKeyRepository;
import com.cdms.security.TenantContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    public ApiKey generateApiKey(Long churchId, String keyName, String permissions, Integer rateLimit, Integer expiryDays) {
        ApiKey apiKey = new ApiKey();
        apiKey.setChurchId(churchId);
        apiKey.setKeyName(keyName);
        apiKey.setApiKey(UUID.randomUUID().toString());
        apiKey.setSecretKey(UUID.randomUUID().toString());
        apiKey.setActive(true);
        apiKey.setPermissions(permissions);
        apiKey.setRateLimit(rateLimit != null ? rateLimit : 1000);
        apiKey.setUsageCount(0L);
        if (expiryDays != null && expiryDays > 0) {
            apiKey.setExpiresAt(LocalDate.now().plusDays(expiryDays));
        }
        return apiKeyRepository.save(apiKey);
    }

    public ApiKey validateApiKey(String apiKey) {
        ApiKey key = apiKeyRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new BadRequestException("Invalid API key"));
        if (!key.isActive()) {
            throw new BadRequestException("API key is revoked");
        }
        if (key.getExpiresAt() != null && key.getExpiresAt().isBefore(LocalDate.now())) {
            throw new BadRequestException("API key has expired");
        }
        return key;
    }

    public void revokeApiKey(Long keyId) {
        ApiKey key = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key", keyId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !key.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("API Key", keyId);
        }
        key.setActive(false);
        apiKeyRepository.save(key);
    }

    public List<ApiKey> getApiKeys(Long churchId) {
        return apiKeyRepository.findByChurchId(churchId);
    }

    public void recordUsage(String apiKey) {
        ApiKey key = apiKeyRepository.findByApiKey(apiKey).orElse(null);
        if (key != null) {
            key.setUsageCount(key.getUsageCount() + 1);
            key.setLastUsedAt(LocalDate.now());
            apiKeyRepository.save(key);
        }
    }

    public ApiKey regenerateKeys(Long keyId) {
        ApiKey key = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key", keyId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !key.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("API Key", keyId);
        }
        key.setApiKey(UUID.randomUUID().toString());
        key.setSecretKey(UUID.randomUUID().toString());
        return apiKeyRepository.save(key);
    }
}
