package com.cdms.controller;

import com.cdms.security.TenantContext;
import com.cdms.service.DataExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/export")
public class DataExportController {

    private final DataExportService dataExportService;

    public DataExportController(DataExportService dataExportService) {
        this.dataExportService = dataExportService;
    }

    @GetMapping("/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<byte[]> exportMembersCsv() {
        Long churchId = TenantContext.getChurchId();
        byte[] csv = dataExportService.exportMembersCsv(churchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=members-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/donations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<byte[]> exportDonationsCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        byte[] csv = dataExportService.exportDonationsCsv(churchId, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=donations-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<byte[]> exportExpensesCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long churchId = TenantContext.getChurchId();
        byte[] csv = dataExportService.exportExpensesCsv(churchId, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/budgets")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<byte[]> exportBudgetsCsv() {
        Long churchId = TenantContext.getChurchId();
        byte[] csv = dataExportService.exportBudgetsCsv(churchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=budgets-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/financial-summary/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR')")
    public ResponseEntity<byte[]> exportFinancialSummaryPdf() {
        Long churchId = TenantContext.getChurchId();
        byte[] pdf = dataExportService.exportFinancialSummaryPdf(churchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial-summary.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
