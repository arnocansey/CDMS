package com.cdms.service;

import com.cdms.entity.Church;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.ChurchRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class WhiteLabelService {

    private final ChurchRepository churchRepository;
    private final TenantService tenantService;

    @Value("${cdms.upload.dir:uploads}")
    private String uploadDir;

    public WhiteLabelService(ChurchRepository churchRepository, TenantService tenantService) {
        this.churchRepository = churchRepository;
        this.tenantService = tenantService;
    }

    public Map<String, Object> getBranding(Long churchId) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));
        Map<String, Object> branding = new HashMap<>();
        branding.put("primaryColor", church.getPrimaryColor());
        branding.put("secondaryColor", church.getSecondaryColor());
        branding.put("customCss", church.getCustomCss());
        branding.put("logoUrl", church.getLogoUrl());
        branding.put("logoDarkUrl", church.getLogoDarkUrl());
        branding.put("darkLogoUrl", church.getLogoDarkUrl()); // FE alias
        branding.put("faviconUrl", church.getFaviconUrl());
        branding.put("customDomain", church.getCustomDomain());
        return branding;
    }

    public Map<String, Object> updateBranding(Long churchId, Map<String, Object> updates) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        if (updates.containsKey("primaryColor")) {
            church.setPrimaryColor((String) updates.get("primaryColor"));
        }
        if (updates.containsKey("secondaryColor")) {
            church.setSecondaryColor((String) updates.get("secondaryColor"));
        }
        if (updates.containsKey("customCss")) {
            church.setCustomCss((String) updates.get("customCss"));
        }
        if (updates.containsKey("logoUrl")) {
            church.setLogoUrl((String) updates.get("logoUrl"));
        }
        if (updates.containsKey("logoDarkUrl") || updates.containsKey("darkLogoUrl")) {
            Object dark = updates.containsKey("logoDarkUrl") ? updates.get("logoDarkUrl") : updates.get("darkLogoUrl");
            church.setLogoDarkUrl((String) dark);
        }
        if (updates.containsKey("faviconUrl")) {
            church.setFaviconUrl((String) updates.get("faviconUrl"));
        }
        if (updates.containsKey("customDomain")) {
            church.setCustomDomain((String) updates.get("customDomain"));
        }

        churchRepository.save(church);
        return getBranding(churchId);
    }

    public String getBrandingCSS(Long churchId) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        StringBuilder css = new StringBuilder();
        css.append(":root {\n");
        css.append("  --primary: ").append(church.getPrimaryColor() != null ? church.getPrimaryColor() : "#2563eb").append(";\n");
        css.append("  --secondary: ").append(church.getSecondaryColor() != null ? church.getSecondaryColor() : "#1e40af").append(";\n");
        css.append("}\n");

        if (church.getCustomCss() != null && !church.getCustomCss().isEmpty()) {
            css.append("\n").append(church.getCustomCss());
        }

        return css.toString();
    }

    public Map<String, Object> getPublicBranding(Long churchId) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));
        Map<String, Object> publicBranding = new HashMap<>();
        publicBranding.put("primaryColor", church.getPrimaryColor());
        publicBranding.put("secondaryColor", church.getSecondaryColor());
        publicBranding.put("logoUrl", church.getLogoUrl());
        publicBranding.put("logoDarkUrl", church.getLogoDarkUrl());
        publicBranding.put("faviconUrl", church.getFaviconUrl());
        publicBranding.put("name", church.getName());
        return publicBranding;
    }

    public String uploadDarkLogo(Long churchId, MultipartFile file) throws IOException {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "dark-logo" + extension;

        Path uploadPath = Paths.get(uploadDir, "church-logos", String.valueOf(churchId), "dark");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        file.transferTo(filePath.toFile());

        String fileUrl = "/api/files/download/church-logos/" + churchId + "/dark/" + filename;
        church.setLogoDarkUrl(fileUrl);
        churchRepository.save(church);

        return fileUrl;
    }

    public String uploadLogo(Long churchId, MultipartFile file) throws IOException {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "logo" + extension;

        Path uploadPath = Paths.get(uploadDir, "church-logos", String.valueOf(churchId), "light");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        file.transferTo(filePath.toFile());

        String fileUrl = "/api/files/download/church-logos/" + churchId + "/light/" + filename;
        church.setLogoUrl(fileUrl);
        churchRepository.save(church);

        return fileUrl;
    }
}
