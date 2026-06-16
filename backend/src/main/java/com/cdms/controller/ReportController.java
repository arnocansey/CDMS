package com.cdms.controller;

import com.cdms.service.ReportingService;
import com.cdms.service.ReceiptPdfService;
import com.cdms.service.ReceiptService;
import com.cdms.service.FinancialService;
import com.cdms.dto.ReceiptDto;
import com.cdms.dto.MemberContributionHistoryDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportingService reportingService;
    private final ReceiptPdfService receiptPdfService;
    private final ReceiptService receiptService;
    private final FinancialService financialService;

    public ReportController(ReportingService reportingService, ReceiptPdfService receiptPdfService,
                           ReceiptService receiptService, FinancialService financialService) {
        this.reportingService = reportingService;
        this.receiptPdfService = receiptPdfService;
        this.receiptService = receiptService;
        this.financialService = financialService;
    }

    @GetMapping("/membership/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<byte[]> generateMembershipReportPdf() {
        byte[] pdf = reportingService.generateMembershipReportPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=membership-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/membership/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR')")
    public ResponseEntity<byte[]> generateMembershipReportExcel() {
        byte[] excel = reportingService.generateMembershipReportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=membership-report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }

    @GetMapping("/financial/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<byte[]> generateFinancialReportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] pdf = reportingService.generateFinancialReportPdf(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/financial/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ResponseEntity<byte[]> generateFinancialReportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] excel = reportingService.generateFinancialReportExcel(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial-report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }

    @GetMapping("/attendance/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<byte[]> generateAttendanceReportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] pdf = reportingService.generateAttendanceReportPdf(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/receipt/{receiptId}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER', 'PASTOR', 'SECRETARY')")
    public ResponseEntity<byte[]> generateReceiptPdf(@PathVariable Long receiptId) {
        ReceiptDto receipt = receiptService.getReceiptById(receiptId);
        byte[] pdf = receiptPdfService.generateReceiptPdf(receipt);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt-" + receipt.getReceiptNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/contribution/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER')")
    public ResponseEntity<byte[]> generateMemberContributionStatement(@PathVariable Long memberId) {
        MemberContributionHistoryDto history = financialService.getMemberContributionHistory(memberId);
        byte[] pdf = receiptPdfService.generateContributionStatementPdf(
                history.getMemberName(),
                history.getContributions(),
                history.getTotalContributions(),
                history.getMonthlyContributions(),
                history.getAnnualContributions());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contribution-statement-" + memberId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
