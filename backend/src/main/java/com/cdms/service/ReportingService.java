package com.cdms.service;

import com.cdms.dto.*;
import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportingService {

    private final MemberService memberService;
    private final AttendanceService attendanceService;
    private final FinancialService financialService;

    public ReportingService(MemberService memberService, AttendanceService attendanceService,
                           FinancialService financialService) {
        this.memberService = memberService;
        this.attendanceService = attendanceService;
        this.financialService = financialService;
    }

    public byte[] generateMembershipReportPdf() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Membership Report", titleFont));
            document.add(new Paragraph("Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy"))));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{30, 30, 30, 20, 20});

            addTableHeader(table, headerFont, new String[]{"Name", "Email", "Phone", "Gender", "Status"});
            addTableRows(table, normalFont);

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateMembershipReportExcel() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Membership Report");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Name", "Email", "Phone", "Gender", "Status"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<MemberDto> members = memberService.getAllMembers(
                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

            int rowNum = 1;
            for (MemberDto member : members) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(member.getFirstName() + " " + member.getLastName());
                row.createCell(1).setCellValue(member.getEmail());
                row.createCell(2).setCellValue(member.getPhone());
                row.createCell(3).setCellValue(member.getGender());
                row.createCell(4).setCellValue(member.isActive() ? "Active" : "Inactive");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }

        return out.toByteArray();
    }

    public byte[] generateFinancialReportPdf(LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            com.lowagie.text.Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            Paragraph churchHeader = new Paragraph("CHURCH EXECUTIVE FINANCIAL BOARD REPORT", titleFont);
            churchHeader.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(churchHeader);

            Paragraph periodPara = new Paragraph("Period: " + (startDate != null ? startDate : "Beginning") + " to " + (endDate != null ? endDate : "Present"), headerFont);
            periodPara.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(periodPara);
            document.add(new Paragraph(" "));

            BigDecimal totalDonations = financialService.getTotalDonations(startDate, endDate);
            BigDecimal totalTithes = financialService.getTotalTithes(startDate, endDate);
            BigDecimal totalOfferings = financialService.getTotalOfferings(startDate, endDate);
            BigDecimal totalIncome = totalDonations.add(totalTithes).add(totalOfferings);
            BigDecimal totalExpenses = financialService.getTotalExpenses(startDate, endDate);
            BigDecimal netBalance = totalIncome.subtract(totalExpenses);

            document.add(new Paragraph("1. OPERATING STATEMENT (SUMMARY OF INFLOWS & OUTFLOWS)", headerFont));
            document.add(new Paragraph(" "));

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(80);
            summaryTable.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);

            addSummaryRow(summaryTable, normalFont, "General Donations & Grants:", "GH₵ " + totalDonations);
            addSummaryRow(summaryTable, normalFont, "Member Tithes:", "GH₵ " + totalTithes);
            addSummaryRow(summaryTable, normalFont, "Sunday & Event Offerings:", "GH₵ " + totalOfferings);
            addSummaryRow(summaryTable, boldFont, "TOTAL OPERATING INCOME:", "GH₵ " + totalIncome);
            addSummaryRow(summaryTable, normalFont, "Total Operating Expenses:", "GH₵ " + totalExpenses);
            addSummaryRow(summaryTable, boldFont, "NET OPERATING SURPLUS / (DEFICIT):", "GH₵ " + netBalance);

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("2. FUND BALANCES & ALLOCATION", headerFont));
            document.add(new Paragraph(" "));

            PdfPTable fundTable = new PdfPTable(3);
            fundTable.setWidthPercentage(100);
            addTableHeader(fundTable, boldFont, new String[]{"Fund Name", "Allocation %", "Estimated Balance"});

            BigDecimal generalFund = netBalance.multiply(new BigDecimal("0.60")).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal buildingFund = netBalance.multiply(new BigDecimal("0.25")).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal welfareFund = netBalance.multiply(new BigDecimal("0.15")).setScale(2, java.math.RoundingMode.HALF_UP);

            fundTable.addCell(new Phrase("General Operating Fund", normalFont));
            fundTable.addCell(new Phrase("60%", normalFont));
            fundTable.addCell(new Phrase("GH₵ " + generalFund, normalFont));

            fundTable.addCell(new Phrase("Building & Facilities Fund", normalFont));
            fundTable.addCell(new Phrase("25%", normalFont));
            fundTable.addCell(new Phrase("GH₵ " + buildingFund, normalFont));

            fundTable.addCell(new Phrase("Welfare & Community Fund", normalFont));
            fundTable.addCell(new Phrase("15%", normalFont));
            fundTable.addCell(new Phrase("GH₵ " + welfareFund, normalFont));

            document.add(fundTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            Paragraph sig = new Paragraph("Report Certified by Lead Auditor & Finance Committee", smallFont);
            sig.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            document.add(sig);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateFinancialReportExcel(LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Executive Financial Report");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("Church Executive Financial Board Report");
            titleRow.createCell(1).setCellValue("Period: " + (startDate != null ? startDate : "Beginning") + " to " + (endDate != null ? endDate : "Present"));

            Row headerRow = sheet.createRow(2);
            String[] headers = {"Financial Category", "Amount (GH₵)", "Percentage of Total Income"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            BigDecimal totalDonations = financialService.getTotalDonations(startDate, endDate);
            BigDecimal totalTithes = financialService.getTotalTithes(startDate, endDate);
            BigDecimal totalOfferings = financialService.getTotalOfferings(startDate, endDate);
            BigDecimal totalIncome = totalDonations.add(totalTithes).add(totalOfferings);
            BigDecimal totalExpenses = financialService.getTotalExpenses(startDate, endDate);
            BigDecimal netBalance = totalIncome.subtract(totalExpenses);

            double incVal = totalIncome.doubleValue() > 0 ? totalIncome.doubleValue() : 1.0;

            Row r3 = sheet.createRow(3);
            r3.createCell(0).setCellValue("General Donations");
            r3.createCell(1).setCellValue(totalDonations.doubleValue());
            r3.createCell(2).setCellValue(String.format("%.2f%%", (totalDonations.doubleValue() / incVal) * 100));

            Row r4 = sheet.createRow(4);
            r4.createCell(0).setCellValue("Member Tithes");
            r4.createCell(1).setCellValue(totalTithes.doubleValue());
            r4.createCell(2).setCellValue(String.format("%.2f%%", (totalTithes.doubleValue() / incVal) * 100));

            Row r5 = sheet.createRow(5);
            r5.createCell(0).setCellValue("Offerings");
            r5.createCell(1).setCellValue(totalOfferings.doubleValue());
            r5.createCell(2).setCellValue(String.format("%.2f%%", (totalOfferings.doubleValue() / incVal) * 100));

            Row r6 = sheet.createRow(6);
            r6.createCell(0).setCellValue("TOTAL OPERATING INCOME");
            r6.createCell(1).setCellValue(totalIncome.doubleValue());
            r6.createCell(2).setCellValue("100.00%");

            Row r7 = sheet.createRow(7);
            r7.createCell(0).setCellValue("TOTAL EXPENSES");
            r7.createCell(1).setCellValue(totalExpenses.doubleValue());
            r7.createCell(2).setCellValue("-");

            Row r8 = sheet.createRow(8);
            r8.createCell(0).setCellValue("NET OPERATING SURPLUS / (DEFICIT)");
            r8.createCell(1).setCellValue(netBalance.doubleValue());
            r8.createCell(2).setCellValue("-");

            for (int i = 0; i < 3; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }

        return out.toByteArray();
    }

    public byte[] generateAttendanceReportPdf(LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            document.add(new Paragraph("Attendance Report", titleFont));
            document.add(new Paragraph("Period: " + startDate + " to " + endDate, headerFont));
            document.add(new Paragraph(" "));

            long totalPresent = attendanceService.getAttendanceCountByDateRange(startDate, endDate);

            com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Total Attendance: " + totalPresent, normalFont));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, com.lowagie.text.Font font, String[] headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, font));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            table.addCell(cell);
        }
    }

    private void addTableRows(PdfPTable table, com.lowagie.text.Font font) {
        List<MemberDto> members = memberService.getAllMembers(
            org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        for (MemberDto member : members) {
            table.addCell(new Phrase(member.getFirstName() + " " + member.getLastName(), font));
            table.addCell(new Phrase(member.getEmail(), font));
            table.addCell(new Phrase(member.getPhone(), font));
            table.addCell(new Phrase(member.getGender(), font));
            table.addCell(new Phrase(member.isActive() ? "Active" : "Inactive", font));
        }
    }

    private void addSummaryRow(PdfPTable table, com.lowagie.text.Font font, String label, String value) {
        table.addCell(new Phrase(label, font));
        table.addCell(new Phrase(value, font));
    }
}
