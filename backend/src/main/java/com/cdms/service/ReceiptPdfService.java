package com.cdms.service;

import com.cdms.dto.ReceiptDto;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptPdfService {

    public byte[] generateReceiptPdf(ReceiptDto receipt) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            Paragraph churchHeader = new Paragraph("CHURCH FINANCIAL MANAGEMENT SYSTEM", titleFont);
            churchHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(churchHeader);

            Paragraph subtitle = new Paragraph("OFFICIAL CONTRIBUTION RECEIPT", subHeaderFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            addInfoRow(infoTable, normalFont, "Receipt Number:", receipt.getReceiptNumber() != null ? receipt.getReceiptNumber() : "N/A");
            addInfoRow(infoTable, normalFont, "Date:", receipt.getReceiptDate() != null ? receipt.getReceiptDate().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")) : "N/A");
            addInfoRow(infoTable, normalFont, "Member Name:", receipt.getMemberName() != null ? receipt.getMemberName() : "N/A");
            addInfoRow(infoTable, normalFont, "Status:", receipt.getStatus() != null ? receipt.getStatus() : "ISSUED");

            document.add(infoTable);
            document.add(new Paragraph(" "));

            PdfPTable contributionTable = new PdfPTable(2);
            contributionTable.setWidthPercentage(100);
            contributionTable.setWidths(new float[]{50, 50});

            Paragraph contributionHeader = new Paragraph("CONTRIBUTION DETAILS", headerFont);
            document.add(contributionHeader);
            document.add(new Paragraph(" "));

            addInfoRow(contributionTable, normalFont, "Contribution Type:", receipt.getContributionType() != null ? receipt.getContributionType() : "N/A");
            addInfoRow(contributionTable, normalFont, "Amount:", receipt.getAmount() != null ? "$" + receipt.getAmount().toString() : "$0.00");

            if (receipt.getNotes() != null && !receipt.getNotes().isEmpty()) {
                addInfoRow(contributionTable, normalFont, "Notes:", receipt.getNotes());
            }

            document.add(contributionTable);
            document.add(new Paragraph(" "));

            PdfPTable treasurerTable = new PdfPTable(2);
            treasurerTable.setWidthPercentage(100);
            treasurerTable.setWidths(new float[]{50, 50});

            Paragraph treasurerHeader = new Paragraph("TREASURER AUTHORIZATION", headerFont);
            document.add(treasurerHeader);
            document.add(new Paragraph(" "));

            addInfoRow(treasurerTable, normalFont, "Treasurer Name:", receipt.getTreasurerName() != null ? receipt.getTreasurerName() : "N/A");

            document.add(treasurerTable);
            document.add(new Paragraph(" "));

            Paragraph signatureLine = new Paragraph("________________________________________", normalFont);
            signatureLine.setAlignment(Element.ALIGN_LEFT);
            document.add(signatureLine);

            Paragraph signatureLabel = new Paragraph("Treasurer Signature", smallFont);
            signatureLabel.setAlignment(Element.ALIGN_LEFT);
            document.add(signatureLabel);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss a")), footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph disclaimer = new Paragraph("This is an official receipt of the Church Financial Management System.", smallFont);
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            document.add(disclaimer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate receipt PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateContributionStatementPdf(String memberName, java.util.List<com.cdms.dto.MemberContributionHistoryDto.ContributionItem> contributions,
                                                    java.math.BigDecimal totalContributions, java.math.BigDecimal monthlyContributions,
                                                    java.math.BigDecimal annualContributions) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            Paragraph churchHeader = new Paragraph("CHURCH FINANCIAL MANAGEMENT SYSTEM", titleFont);
            churchHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(churchHeader);

            Paragraph subtitle = new Paragraph("MEMBER CONTRIBUTION STATEMENT", headerFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Member: " + (memberName != null ? memberName : "N/A"), boldFont));
            document.add(new Paragraph("Statement Period: All Time", normalFont));
            document.add(new Paragraph("Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);
            summaryTable.setHorizontalAlignment(Element.ALIGN_LEFT);

            addInfoRow(summaryTable, boldFont, "Total Contributions:", "GH₵ " + (totalContributions != null ? totalContributions.toString() : "0.00"));
            addInfoRow(summaryTable, boldFont, "Monthly Average:", "GH₵ " + (monthlyContributions != null ? monthlyContributions.toString() : "0.00"));
            addInfoRow(summaryTable, boldFont, "Annual Total:", "GH₵ " + (annualContributions != null ? annualContributions.toString() : "0.00"));

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            Paragraph detailHeader = new Paragraph("CONTRIBUTION HISTORY", headerFont);
            document.add(detailHeader);
            document.add(new Paragraph(" "));

            if (contributions != null && !contributions.isEmpty()) {
                PdfPTable detailTable = new PdfPTable(4);
                detailTable.setWidthPercentage(100);
                detailTable.setWidths(new float[]{20, 25, 25, 30});

                PdfPCell headerCell1 = new PdfPCell(new Phrase("Date", boldFont));
                headerCell1.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(headerCell1);

                PdfPCell headerCell2 = new PdfPCell(new Phrase("Type", boldFont));
                headerCell2.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(headerCell2);

                PdfPCell headerCell3 = new PdfPCell(new Phrase("Amount", boldFont));
                headerCell3.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(headerCell3);

                PdfPCell headerCell4 = new PdfPCell(new Phrase("Description", boldFont));
                headerCell4.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(headerCell4);

                for (com.cdms.dto.MemberContributionHistoryDto.ContributionItem item : contributions) {
                    detailTable.addCell(new Phrase(item.getDate() != null ? item.getDate().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")) : "N/A", normalFont));
                    detailTable.addCell(new Phrase(item.getType() != null ? item.getType() : "N/A", normalFont));
                    detailTable.addCell(new Phrase(item.getAmount() != null ? "GH₵ " + item.getAmount().toString() : "GH₵ 0.00", normalFont));
                    detailTable.addCell(new Phrase(item.getDescription() != null ? item.getDescription() : "", normalFont));
                }
            } else {
                document.add(new Paragraph("No contributions found.", normalFont));
            }

            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("This statement is generated for informational purposes.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate contribution statement PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateAnnualTaxStatementPdf(String memberName, int year,
                                                 java.util.List<com.cdms.dto.MemberContributionHistoryDto.ContributionItem> contributions,
                                                 java.math.BigDecimal totalTaxDeductible) {
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
            Font italicSmallFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8);

            Paragraph churchHeader = new Paragraph("CHURCH FINANCIAL MANAGEMENT SYSTEM", titleFont);
            churchHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(churchHeader);

            Paragraph subtitle = new Paragraph("OFFICIAL ANNUAL TAX CONTRIBUTION STATEMENT (" + year + ")", headerFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{50, 50});
            addInfoRow(metaTable, boldFont, "Contributor Name:", memberName != null ? memberName : "N/A");
            addInfoRow(metaTable, normalFont, "Tax Year:", String.valueOf(year));
            addInfoRow(metaTable, normalFont, "Issued Date:", LocalDate.now().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")));
            addInfoRow(metaTable, boldFont, "Total Tax-Deductible Contributions:", "GH₵ " + (totalTaxDeductible != null ? totalTaxDeductible.toString() : "0.00"));
            document.add(metaTable);
            document.add(new Paragraph(" "));

            Paragraph notice = new Paragraph("Tax Compliance Notice: No goods or services were provided in exchange for these contributions other than intangible religious benefits.", italicSmallFont);
            document.add(notice);
            document.add(new Paragraph(" "));

            Paragraph detailHeader = new Paragraph("ITEMIZED CONTRIBUTIONS (" + year + ")", headerFont);
            document.add(detailHeader);
            document.add(new Paragraph(" "));

            if (contributions != null && !contributions.isEmpty()) {
                PdfPTable detailTable = new PdfPTable(4);
                detailTable.setWidthPercentage(100);
                detailTable.setWidths(new float[]{20, 25, 25, 30});

                PdfPCell cell1 = new PdfPCell(new Phrase("Date", boldFont));
                cell1.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(cell1);

                PdfPCell cell2 = new PdfPCell(new Phrase("Type", boldFont));
                cell2.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(cell2);

                PdfPCell cell3 = new PdfPCell(new Phrase("Amount", boldFont));
                cell3.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(cell3);

                PdfPCell cell4 = new PdfPCell(new Phrase("Description", boldFont));
                cell4.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                detailTable.addCell(cell4);

                for (com.cdms.dto.MemberContributionHistoryDto.ContributionItem item : contributions) {
                    if (item.getDate() != null && item.getDate().getYear() == year) {
                        detailTable.addCell(new Phrase(item.getDate().format(DateTimeFormatter.ofPattern("MM/dd/yyyy")), normalFont));
                        detailTable.addCell(new Phrase(item.getType() != null ? item.getType() : "CONTRIBUTION", normalFont));
                        detailTable.addCell(new Phrase(item.getAmount() != null ? "GH₵ " + item.getAmount().toString() : "GH₵ 0.00", normalFont));
                        detailTable.addCell(new Phrase(item.getDescription() != null ? item.getDescription() : "-", normalFont));
                    }
                }
                document.add(detailTable);
            } else {
                document.add(new Paragraph("No contributions recorded for tax year " + year + ".", normalFont));
            }

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            Paragraph signatureLine = new Paragraph("________________________________________", normalFont);
            document.add(signatureLine);
            Paragraph signatureLabel = new Paragraph("Authorized Financial Officer / Treasurer Signature", smallFont);
            document.add(signatureLabel);
            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph("Thank you for your faithful support. Please keep this statement for your tax records.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate annual tax statement PDF", e);
        }

        return out.toByteArray();
    }

    private void addInfoRow(PdfPTable table, Font font, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(0);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(0);
        table.addCell(valueCell);
    }
}

