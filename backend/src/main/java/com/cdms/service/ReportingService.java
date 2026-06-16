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
    private final EventService eventService;

    public ReportingService(MemberService memberService, AttendanceService attendanceService,
                           FinancialService financialService, EventService eventService) {
        this.memberService = memberService;
        this.attendanceService = attendanceService;
        this.financialService = financialService;
        this.eventService = eventService;
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
            com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Financial Report", titleFont));
            document.add(new Paragraph("Period: " + startDate + " to " + endDate));
            document.add(new Paragraph(" "));

            BigDecimal totalDonations = financialService.getTotalDonations(startDate, endDate);
            BigDecimal totalTithes = financialService.getTotalTithes(startDate, endDate);
            BigDecimal totalOfferings = financialService.getTotalOfferings(startDate, endDate);
            BigDecimal totalExpenses = financialService.getTotalExpenses(startDate, endDate);
            BigDecimal netBalance = totalDonations.add(totalTithes).add(totalOfferings).subtract(totalExpenses);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);
            summaryTable.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);

            addSummaryRow(summaryTable, normalFont, "Total Donations:", totalDonations.toString());
            addSummaryRow(summaryTable, normalFont, "Total Tithes:", totalTithes.toString());
            addSummaryRow(summaryTable, normalFont, "Total Offerings:", totalOfferings.toString());
            addSummaryRow(summaryTable, normalFont, "Total Expenses:", totalExpenses.toString());
            addSummaryRow(summaryTable, normalFont, "Net Balance:", netBalance.toString());

            document.add(summaryTable);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateFinancialReportExcel(LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Financial Report");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("Financial Report");
            titleRow.createCell(1).setCellValue("Period: " + startDate + " to " + endDate);

            Row headerRow = sheet.createRow(2);
            String[] headers = {"Category", "Amount"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            BigDecimal totalDonations = financialService.getTotalDonations(startDate, endDate);
            BigDecimal totalTithes = financialService.getTotalTithes(startDate, endDate);
            BigDecimal totalOfferings = financialService.getTotalOfferings(startDate, endDate);
            BigDecimal totalExpenses = financialService.getTotalExpenses(startDate, endDate);

            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue("Total Donations");
            row3.createCell(1).setCellValue(totalDonations.doubleValue());

            Row row4 = sheet.createRow(4);
            row4.createCell(0).setCellValue("Total Tithes");
            row4.createCell(1).setCellValue(totalTithes.doubleValue());

            Row row5 = sheet.createRow(5);
            row5.createCell(0).setCellValue("Total Offerings");
            row5.createCell(1).setCellValue(totalOfferings.doubleValue());

            Row row6 = sheet.createRow(6);
            row6.createCell(0).setCellValue("Total Expenses");
            row6.createCell(1).setCellValue(totalExpenses.doubleValue());

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

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
            document.add(new Paragraph("Period: " + startDate + " to " + endDate));
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
