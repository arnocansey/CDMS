package com.cdms.service;

import com.cdms.entity.Budget;
import com.cdms.entity.Donation;
import com.cdms.entity.Expense;
import com.cdms.entity.Member;
import com.cdms.repository.BudgetRepository;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.MemberRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DataExportService {

    private static final byte[] UTF8_BOM = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    private final MemberRepository memberRepository;
    private final DonationRepository donationRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ReceiptPdfService receiptPdfService;

    public DataExportService(MemberRepository memberRepository, DonationRepository donationRepository,
                             ExpenseRepository expenseRepository, BudgetRepository budgetRepository,
                             ReceiptPdfService receiptPdfService) {
        this.memberRepository = memberRepository;
        this.donationRepository = donationRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.receiptPdfService = receiptPdfService;
    }

    public byte[] exportMembersCsv(Long churchId) {
        List<Member> members = memberRepository.findByChurchId(churchId);
        StringWriter writer = new StringWriter();

        writer.write("Name,Email,Phone,Membership Date,Active\n");
        for (Member member : members) {
            String name = escapeCsv(member.getFirstName() + " " + member.getLastName());
            String email = escapeCsv(member.getEmail() != null ? member.getEmail() : "");
            String phone = escapeCsv(member.getPhone() != null ? member.getPhone() : "");
            String membershipDate = member.getMembershipDate() != null
                    ? member.getMembershipDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "";
            String active = member.isActive() ? "Yes" : "No";

            writer.write(String.format("%s,%s,%s,%s,%s\n", name, email, phone, membershipDate, active));
        }

        return prependBom(writer.toString());
    }

    public byte[] exportDonationsCsv(Long churchId, LocalDate from, LocalDate to) {
        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        StringWriter writer = new StringWriter();

        writer.write("Date,Member,Amount,Category,Method\n");
        for (Donation donation : donations) {
            String date = donation.getDonationDate() != null
                    ? donation.getDonationDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "";
            String member = "";
            if (donation.getMember() != null) {
                member = escapeCsv(donation.getMember().getFirstName() + " " + donation.getMember().getLastName());
            }
            String amount = donation.getAmount() != null ? donation.getAmount().toString() : "0.00";
            String category = escapeCsv(donation.getCategory() != null ? donation.getCategory() : "");
            String method = escapeCsv(donation.getPaymentMethod() != null ? donation.getPaymentMethod() : "");

            writer.write(String.format("%s,%s,%s,%s,%s\n", date, member, amount, category, method));
        }

        return prependBom(writer.toString());
    }

    public byte[] exportExpensesCsv(Long churchId, LocalDate from, LocalDate to) {
        List<Expense> expenses = expenseRepository.findByChurchIdAndExpenseDateBetween(churchId, from, to);
        StringWriter writer = new StringWriter();

        writer.write("Date,Category,Amount,Description,Approval Status\n");
        for (Expense expense : expenses) {
            String date = expense.getExpenseDate() != null
                    ? expense.getExpenseDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "";
            String category = escapeCsv(expense.getCategory() != null ? expense.getCategory() : "");
            String amount = expense.getAmount() != null ? expense.getAmount().toString() : "0.00";
            String description = escapeCsv(expense.getDescription() != null ? expense.getDescription() : "");
            String status = escapeCsv(expense.getApprovalStatus() != null ? expense.getApprovalStatus() : "");

            writer.write(String.format("%s,%s,%s,%s,%s\n", date, category, amount, description, status));
        }

        return prependBom(writer.toString());
    }

    public byte[] exportBudgetsCsv(Long churchId) {
        List<Budget> budgets = budgetRepository.findByChurchId(churchId);
        StringWriter writer = new StringWriter();

        writer.write("Name,Amount,Spent,Remaining\n");
        for (Budget budget : budgets) {
            String name = escapeCsv(budget.getName() != null ? budget.getName() : "");
            String amount = budget.getAmount() != null ? budget.getAmount().toString() : "0.00";
            String spent = budget.getSpent() != null ? budget.getSpent().toString() : "0.00";
            BigDecimal remaining = BigDecimal.ZERO;
            if (budget.getAmount() != null && budget.getSpent() != null) {
                remaining = budget.getAmount().subtract(budget.getSpent());
            }

            writer.write(String.format("%s,%s,%s,%s\n", name, amount, spent, remaining.toString()));
        }

        return prependBom(writer.toString());
    }

    public byte[] exportFinancialSummaryPdf(Long churchId) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            Paragraph churchHeader = new Paragraph("CHURCH FINANCIAL MANAGEMENT SYSTEM", titleFont);
            churchHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(churchHeader);

            Paragraph subtitle = new Paragraph("FINANCIAL SUMMARY REPORT", headerFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(new Paragraph("Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")), normalFont));
            document.add(new Paragraph(" "));

            LocalDate now = LocalDate.now();
            LocalDate startOfYear = LocalDate.of(now.getYear(), 1, 1);

            BigDecimal totalDonations = donationRepository.sumByChurchIdAndDateRange(churchId, startOfYear, now);
            BigDecimal totalExpenses = expenseRepository.sumByChurchIdAndDateRange(churchId, startOfYear, now);
            BigDecimal balance = totalDonations.subtract(totalExpenses);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(60);
            summaryTable.setHorizontalAlignment(Element.ALIGN_LEFT);

            addInfoRow(summaryTable, boldFont, "Period:", startOfYear + " to " + now);
            addInfoRow(summaryTable, boldFont, "Total Income:", "$" + totalDonations);
            addInfoRow(summaryTable, boldFont, "Total Expenses:", "$" + totalExpenses);
            addInfoRow(summaryTable, boldFont, "Net Balance:", "$" + balance);

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            Paragraph expenseHeader = new Paragraph("EXPENSE BREAKDOWN BY CATEGORY", headerFont);
            document.add(expenseHeader);
            document.add(new Paragraph(" "));

            List<Expense> expenses = expenseRepository.findByChurchIdAndExpenseDateBetween(churchId, startOfYear, now);
            PdfPTable expenseTable = new PdfPTable(2);
            expenseTable.setWidthPercentage(60);
            expenseTable.setHorizontalAlignment(Element.ALIGN_LEFT);

            java.util.Map<String, BigDecimal> categoryTotals = new java.util.LinkedHashMap<>();
            for (Expense expense : expenses) {
                String cat = expense.getCategory() != null ? expense.getCategory() : "Other";
                categoryTotals.merge(cat, expense.getAmount(), BigDecimal::add);
            }

            PdfPCell catHeader1 = new PdfPCell(new Phrase("Category", boldFont));
            catHeader1.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            catHeader1.setBorder(0);
            expenseTable.addCell(catHeader1);

            PdfPCell catHeader2 = new PdfPCell(new Phrase("Amount", boldFont));
            catHeader2.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            catHeader2.setBorder(0);
            expenseTable.addCell(catHeader2);

            for (java.util.Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
                PdfPCell catCell = new PdfPCell(new Phrase(entry.getKey(), normalFont));
                catCell.setBorder(0);
                expenseTable.addCell(catCell);

                PdfPCell amtCell = new PdfPCell(new Phrase("$" + entry.getValue(), normalFont));
                amtCell.setBorder(0);
                expenseTable.addCell(amtCell);
            }

            document.add(expenseTable);
            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph("This report is generated by the Church Financial Management System.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph timestamp = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss a")), smallFont);
            timestamp.setAlignment(Element.ALIGN_CENTER);
            document.add(timestamp);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate financial summary PDF", e);
        }

        return out.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private byte[] prependBom(String csvContent) {
        byte[] csvBytes = csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] result = new byte[UTF8_BOM.length + csvBytes.length];
        System.arraycopy(UTF8_BOM, 0, result, 0, UTF8_BOM.length);
        System.arraycopy(csvBytes, 0, result, UTF8_BOM.length, csvBytes.length);
        return result;
    }

    private void addInfoRow(PdfPTable table, Font font, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new com.lowagie.text.Phrase(label, font));
        labelCell.setBorder(0);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new com.lowagie.text.Phrase(value, font));
        valueCell.setBorder(0);
        table.addCell(valueCell);
    }
}
