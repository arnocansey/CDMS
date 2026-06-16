package com.cdms.service;

import com.cdms.entity.Donation;
import com.cdms.entity.EmailDigest;
import com.cdms.entity.Expense;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.EmailDigestRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.AttendanceRepository;
import com.cdms.repository.MemberRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmailDigestService {

    private static final Logger logger = LoggerFactory.getLogger(EmailDigestService.class);

    private final EmailDigestRepository emailDigestRepository;
    private final DonationRepository donationRepository;
    private final ExpenseRepository expenseRepository;
    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@cdms.com}")
    private String fromEmail;

    @Value("${app.name:Church Financial Management System}")
    private String appName;

    public EmailDigestService(EmailDigestRepository emailDigestRepository,
                              DonationRepository donationRepository,
                              ExpenseRepository expenseRepository,
                              AttendanceRepository attendanceRepository,
                              MemberRepository memberRepository,
                              @org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.emailDigestRepository = emailDigestRepository;
        this.donationRepository = donationRepository;
        this.expenseRepository = expenseRepository;
        this.attendanceRepository = attendanceRepository;
        this.memberRepository = memberRepository;
        this.mailSender = mailSender;
    }

    public EmailDigest subscribe(Long churchId, String email, String name, String type) {
        EmailDigest existing = emailDigestRepository.findByChurchIdAndRecipientEmail(churchId, email)
                .orElse(null);

        if (existing != null) {
            existing.setActive(true);
            existing.setDigestType(type);
            existing.setRecipientName(name);
            return emailDigestRepository.save(existing);
        }

        EmailDigest digest = new EmailDigest(churchId, email, name, type);
        return emailDigestRepository.save(digest);
    }

    public void unsubscribe(Long churchId, String email) {
        emailDigestRepository.findByChurchIdAndRecipientEmail(churchId, email)
                .ifPresent(digest -> {
                    digest.setActive(false);
                    emailDigestRepository.save(digest);
                });
    }

    public String generateWeeklyDigest(Long churchId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today;

        BigDecimal totalGiving = donationRepository.sumByChurchIdAndDateRange(churchId, weekStart, weekEnd);
        long donationCount = donationRepository.findByChurchIdAndDonationDateBetween(churchId, weekStart, weekEnd).size();

        List<Donation> weekDonations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, weekStart, weekEnd);
        Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();
        for (Donation d : weekDonations) {
            categoryTotals.merge(d.getCategory(), d.getAmount(), BigDecimal::add);
        }
        Map<String, BigDecimal> topCategories = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        long attendanceCount = attendanceRepository.countPresentByDateRange(weekStart, weekEnd);
        long activeMembers = memberRepository.countActiveMembersByChurchId(churchId);

        List<Expense> pendingExpenses = expenseRepository.findByChurchId(churchId).stream()
                .filter(e -> "PENDING".equals(e.getApprovalStatus()))
                .collect(Collectors.toList());
        long pendingApprovals = pendingExpenses.size();

        LocalDate weekAgo = today.minusDays(7);
        long newMembers = memberRepository.findByChurchId(churchId).stream()
                .filter(m -> m.getMembershipDate() != null && m.getMembershipDate().isAfter(weekAgo))
                .count();

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        html.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");
        html.append("<h2 style='color: #2c3e50; text-align: center;'>").append(appName).append("</h2>");
        html.append("<hr style='border: 1px solid #eee;'>");
        html.append("<h3 style='color: #27ae60;'>Weekly Digest</h3>");
        html.append("<p style='color: #7f8c8d;'>Week of ").append(weekStart).append(" to ").append(weekEnd).append("</p>");

        html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
        html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Giving Summary</h4>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Giving:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: #27ae60; font-weight: bold;'>$").append(totalGiving != null ? totalGiving.toString() : "0.00").append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Number of Donations:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(donationCount).append("</td></tr>");
        html.append("</table></div>");

        if (!topCategories.isEmpty()) {
            html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
            html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Top Giving Categories</h4>");
            html.append("<table style='width: 100%; border-collapse: collapse;'>");
            for (Map.Entry<String, BigDecimal> entry : topCategories.entrySet()) {
                html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(entry.getKey()).append("</td>");
                html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>$").append(entry.getValue().toString()).append("</td></tr>");
            }
            html.append("</table></div>");
        }

        html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
        html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Attendance Summary</h4>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Attendance:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(attendanceCount).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Active Members:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(activeMembers).append("</td></tr>");
        html.append("</table></div>");

        html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
        html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Other Metrics</h4>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Pending Approvals:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: #e74c3c;'>").append(pendingApprovals).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>New Members This Week:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(newMembers).append("</td></tr>");
        html.append("</table></div>");

        html.append("<hr style='border: 1px solid #eee;'>");
        html.append("<p style='text-align: center; color: #7f8c8d; font-size: 12px;'>");
        html.append("This is an automated digest from ").append(appName).append("</p>");
        html.append("</div></body></html>");

        return html.toString();
    }

    public String generateMonthlyDigest(Long churchId) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today;

        BigDecimal totalGiving = donationRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd);
        BigDecimal totalExpenses = expenseRepository.sumByChurchIdAndDateRange(churchId, monthStart, monthEnd);
        long donationCount = donationRepository.findByChurchIdAndDonationDateBetween(churchId, monthStart, monthEnd).size();

        List<Donation> monthDonations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, monthStart, monthEnd);
        Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();
        for (Donation d : monthDonations) {
            categoryTotals.merge(d.getCategory(), d.getAmount(), BigDecimal::add);
        }

        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        List<Expense> monthExpenses = expenseRepository.findByChurchIdAndExpenseDateBetween(churchId, monthStart, monthEnd);
        for (Expense e : monthExpenses) {
            expenseByCategory.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }

        long attendanceCount = attendanceRepository.countPresentByDateRange(monthStart, monthEnd);
        long activeMembers = memberRepository.countActiveMembersByChurchId(churchId);

        List<Expense> pendingExpenses = expenseRepository.findByChurchId(churchId).stream()
                .filter(e -> "PENDING".equals(e.getApprovalStatus()))
                .collect(Collectors.toList());
        long pendingApprovals = pendingExpenses.size();

        LocalDate monthAgo = today.minusDays(30);
        long newMembers = memberRepository.findByChurchId(churchId).stream()
                .filter(m -> m.getMembershipDate() != null && m.getMembershipDate().isAfter(monthAgo))
                .count();

        StringBuilder givingBarChart = new StringBuilder();
        if (!categoryTotals.isEmpty()) {
            BigDecimal maxVal = categoryTotals.values().stream().max(BigDecimal::compareTo).orElse(BigDecimal.ONE);
            for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
                int width = maxVal.compareTo(BigDecimal.ZERO) > 0
                        ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(maxVal, 0, BigDecimal.ROUND_HALF_UP).intValue()
                        : 0;
                givingBarChart.append("<div style='margin: 5px 0;'>");
                givingBarChart.append("<span style='display: inline-block; width: 120px;'>").append(entry.getKey()).append("</span>");
                givingBarChart.append("<div style='display: inline-block; background-color: #27ae60; height: 18px; width: ").append(width).append("px; border-radius: 3px;'></div> ");
                givingBarChart.append("<span>$").append(entry.getValue().toString()).append("</span>");
                givingBarChart.append("</div>");
            }
        }

        StringBuilder expenseBarChart = new StringBuilder();
        if (!expenseByCategory.isEmpty()) {
            BigDecimal maxVal = expenseByCategory.values().stream().max(BigDecimal::compareTo).orElse(BigDecimal.ONE);
            for (Map.Entry<String, BigDecimal> entry : expenseByCategory.entrySet()) {
                int width = maxVal.compareTo(BigDecimal.ZERO) > 0
                        ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(maxVal, 0, BigDecimal.ROUND_HALF_UP).intValue()
                        : 0;
                expenseBarChart.append("<div style='margin: 5px 0;'>");
                expenseBarChart.append("<span style='display: inline-block; width: 120px;'>").append(entry.getKey()).append("</span>");
                expenseBarChart.append("<div style='display: inline-block; background-color: #e74c3c; height: 18px; width: ").append(width).append("px; border-radius: 3px;'></div> ");
                expenseBarChart.append("<span>$").append(entry.getValue().toString()).append("</span>");
                expenseBarChart.append("</div>");
            }
        }

        BigDecimal netIncome = (totalGiving != null ? totalGiving : BigDecimal.ZERO)
                .subtract(totalExpenses != null ? totalExpenses : BigDecimal.ZERO);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        html.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");
        html.append("<h2 style='color: #2c3e50; text-align: center;'>").append(appName).append("</h2>");
        html.append("<hr style='border: 1px solid #eee;'>");
        html.append("<h3 style='color: #27ae60;'>Monthly Financial Digest</h3>");
        html.append("<p style='color: #7f8c8d;'>").append(monthStart.getMonth()).append(" ").append(monthStart.getYear()).append("</p>");

        html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
        html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Financial Overview</h4>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Giving:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: #27ae60; font-weight: bold;'>$").append(totalGiving != null ? totalGiving.toString() : "0.00").append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Expenses:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: #e74c3c; font-weight: bold;'>$").append(totalExpenses != null ? totalExpenses.toString() : "0.00").append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Net Income:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: ").append(netIncome.compareTo(BigDecimal.ZERO) >= 0 ? "#27ae60" : "#e74c3c").append("; font-weight: bold;'>$").append(netIncome.toString()).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Number of Donations:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(donationCount).append("</td></tr>");
        html.append("</table></div>");

        if (!categoryTotals.isEmpty()) {
            html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
            html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Giving by Category</h4>");
            html.append(givingBarChart);
            html.append("</div>");
        }

        if (!expenseByCategory.isEmpty()) {
            html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
            html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Expenses by Category</h4>");
            html.append(expenseBarChart);
            html.append("</div>");
        }

        html.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
        html.append("<h4 style='margin-top: 0; color: #2c3e50;'>Membership &amp; Attendance</h4>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Attendance:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(attendanceCount).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Active Members:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(activeMembers).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>New Members This Month:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee;'>").append(newMembers).append("</td></tr>");
        html.append("<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Pending Approvals:</strong></td>");
        html.append("<td style='padding: 8px; border-bottom: 1px solid #eee; color: #e74c3c;'>").append(pendingApprovals).append("</td></tr>");
        html.append("</table></div>");

        html.append("<hr style='border: 1px solid #eee;'>");
        html.append("<p style='text-align: center; color: #7f8c8d; font-size: 12px;'>");
        html.append("This is an automated monthly digest from ").append(appName).append("</p>");
        html.append("</div></body></html>");

        return html.toString();
    }

    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyDigests() {
        sendDigests("WEEKLY");
    }

    @Scheduled(cron = "0 0 8 1 * *")
    public void sendMonthlyDigests() {
        sendDigests("MONTHLY");
    }

    public void sendDigests(String type) {
        List<EmailDigest> activeDigests = emailDigestRepository.findByChurchIdAndActive(1L, true).stream()
                .filter(d -> type.equalsIgnoreCase(d.getDigestType()))
                .collect(Collectors.toList());

        for (EmailDigest digest : activeDigests) {
            try {
                if (mailSender == null) {
                    logger.warn("Email not configured, skipping digest to {}", digest.getRecipientEmail());
                    continue;
                }
                String htmlContent;
                if ("MONTHLY".equalsIgnoreCase(type)) {
                    htmlContent = generateMonthlyDigest(digest.getChurchId());
                } else {
                    htmlContent = generateWeeklyDigest(digest.getChurchId());
                }

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(digest.getRecipientEmail());
                helper.setSubject(appName + " - " + type + " Digest");
                helper.setText(htmlContent, true);
                mailSender.send(message);

                digest.setLastSentDate(LocalDate.now());
                emailDigestRepository.save(digest);
                logger.info("{} digest sent to {}", type, digest.getRecipientEmail());
            } catch (MessagingException e) {
                logger.error("Failed to send {} digest to {}: {}", type, digest.getRecipientEmail(), e.getMessage());
            }
        }
    }

    public Map<String, Object> getDigestStats(Long churchId) {
        Map<String, Object> stats = new HashMap<>();
        long subscriberCount = emailDigestRepository.countByChurchIdAndActive(churchId, true);
        stats.put("subscriberCount", subscriberCount);

        List<EmailDigest> digests = emailDigestRepository.findByChurchIdAndActive(churchId, true);
        LocalDate lastWeeklySent = digests.stream()
                .filter(d -> "WEEKLY".equals(d.getDigestType()))
                .map(EmailDigest::getLastSentDate)
                .filter(d -> d != null)
                .max(LocalDate::compareTo)
                .orElse(null);
        LocalDate lastMonthlySent = digests.stream()
                .filter(d -> "MONTHLY".equals(d.getDigestType()))
                .map(EmailDigest::getLastSentDate)
                .filter(d -> d != null)
                .max(LocalDate::compareTo)
                .orElse(null);
        stats.put("lastWeeklySent", lastWeeklySent);
        stats.put("lastMonthlySent", lastMonthlySent);

        return stats;
    }
}
