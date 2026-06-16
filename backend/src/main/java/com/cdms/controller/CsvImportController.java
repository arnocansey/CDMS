package com.cdms.controller;

import com.cdms.entity.ImportJob;
import com.cdms.security.TenantContext;
import com.cdms.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/import")
public class CsvImportController {

    private final CsvImportService csvImportService;

    public CsvImportController(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    @PostMapping("/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<ImportJob> importMembers(@RequestParam("file") MultipartFile file) {
        Long churchId = TenantContext.getChurchId();
        ImportJob job = csvImportService.importMembers(churchId, file, "admin");
        return ResponseEntity.ok(job);
    }

    @PostMapping("/donations")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<ImportJob> importDonations(@RequestParam("file") MultipartFile file) {
        Long churchId = TenantContext.getChurchId();
        ImportJob job = csvImportService.importDonations(churchId, file, "admin");
        return ResponseEntity.ok(job);
    }

    @PostMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<ImportJob> importExpenses(@RequestParam("file") MultipartFile file) {
        Long churchId = TenantContext.getChurchId();
        ImportJob job = csvImportService.importExpenses(churchId, file, "admin");
        return ResponseEntity.ok(job);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<ImportJob>> getImportHistory() {
        Long churchId = TenantContext.getChurchId();
        List<ImportJob> history = csvImportService.getImportHistory(churchId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/errors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<List<String>> getImportErrors(@PathVariable Long id) {
        List<String> errors = csvImportService.getImportErrors(id);
        return ResponseEntity.ok(errors);
    }
}
