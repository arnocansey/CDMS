package com.cdms.controller;

import com.cdms.entity.Church;
import com.cdms.repository.ChurchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/churches")
public class AdminChurchController {

    private final ChurchRepository churchRepository;

    public AdminChurchController(ChurchRepository churchRepository) {
        this.churchRepository = churchRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<Church>> listAllChurches() {
        List<Church> churches = churchRepository.findAll();
        return ResponseEntity.ok(churches);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getChurchStats() {
        List<Church> churches = churchRepository.findAll();
        long totalChurches = churches.size();
        long enabledChurches = churches.stream().filter(Church::isEnabled).count();

        return ResponseEntity.ok(Map.of(
                "totalChurches", totalChurches,
                "enabledChurches", enabledChurches,
                "disabledChurches", totalChurches - enabledChurches
        ));
    }
}
