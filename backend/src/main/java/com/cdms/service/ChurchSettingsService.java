package com.cdms.service;

import com.cdms.entity.Church;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchRepository;
import com.cdms.security.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ChurchSettingsService {

    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "name", "email", "phone", "address", "city", "state", "zipCode",
            "timezone", "currency", "currencySymbol", "fiscalYearStart",
            "emailFromName", "emailFromAddress", "website", "logoUrl"
    );

    private final ChurchRepository churchRepository;

    @Value("${cdms.upload.dir:uploads}")
    private String uploadDir;

    public ChurchSettingsService(ChurchRepository churchRepository) {
        this.churchRepository = churchRepository;
    }

    public Church getChurchSettings(Long churchId) {
        return churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));
    }

    public Church updateChurchSettings(Long churchId, Map<String, Object> updates) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();

            if (!ALLOWED_FIELDS.contains(field)) {
                continue;
            }

            switch (field) {
                case "name" -> church.setName((String) value);
                case "email" -> church.setEmail((String) value);
                case "phone" -> church.setPhone((String) value);
                case "address" -> church.setAddress((String) value);
                case "city" -> church.setCity((String) value);
                case "state" -> church.setState((String) value);
                case "zipCode" -> church.setZipCode((String) value);
                case "timezone" -> church.setTimezone((String) value);
                case "currency" -> church.setCurrency((String) value);
                case "currencySymbol" -> church.setCurrencySymbol((String) value);
                case "fiscalYearStart" -> church.setFiscalYearStart(((Number) value).intValue());
                case "emailFromName" -> church.setEmailFromName((String) value);
                case "emailFromAddress" -> church.setEmailFromAddress((String) value);
                case "website" -> church.setWebsite((String) value);
                case "logoUrl" -> church.setLogoUrl((String) value);
            }
        }

        return churchRepository.save(church);
    }

    public Church uploadLogo(Long churchId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        try {
            Path logoDir = Paths.get(uploadDir, "church-logos", String.valueOf(churchId));
            if (!Files.exists(logoDir)) {
                Files.createDirectories(logoDir);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = logoDir.resolve(filename);
            file.transferTo(filePath.toFile());

            String logoUrl = "/api/church-settings/logo/" + churchId + "/" + filename;
            church.setLogoUrl(logoUrl);

            return churchRepository.save(church);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload logo: " + e.getMessage());
        }
    }

    public Church getPublicChurchInfo(Long churchId) {
        return churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));
    }
}
