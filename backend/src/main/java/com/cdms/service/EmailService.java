package com.cdms.service;

import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnBean(JavaMailSender.class)
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@cdms.com}")
    private String fromEmail;

    @Value("${app.name:Church Financial Management System}")
    private String appName;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendReceiptEmail(String toEmail, String memberName, String receiptNumber,
                                  java.math.BigDecimal amount, byte[] pdfAttachment) {
        try {
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Contribution Receipt - " + receiptNumber);

            String htmlContent = buildReceiptEmailContent(memberName, receiptNumber, amount);
            helper.setText(htmlContent, true);

            if (pdfAttachment != null && pdfAttachment.length > 0) {
                helper.addAttachment("receipt-" + receiptNumber + ".pdf", new jakarta.activation.DataSource() {
                    @Override
                    public java.io.InputStream getInputStream() throws java.io.IOException {
                        return new java.io.ByteArrayInputStream(pdfAttachment);
                    }

                    @Override
                    public String getContentType() {
                        return "application/pdf";
                    }

                    @Override
                    public String getName() {
                        return "receipt-" + receiptNumber + ".pdf";
                    }

                    @Override
                    public java.io.OutputStream getOutputStream() throws java.io.IOException {
                        return new java.io.ByteArrayOutputStream();
                    }
                });
            }

            mailSender.send(message);
            logger.info("Receipt email sent to {} for receipt {}", toEmail, receiptNumber);
        } catch (MessagingException e) {
            logger.error("Failed to send receipt email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send receipt email", e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - " + appName);

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmailContent(resetToken, resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Password reset email sent to {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildReceiptEmailContent(String memberName, String receiptNumber, java.math.BigDecimal amount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #2c3e50; text-align: center;'>CHURCH FINANCIAL MANAGEMENT SYSTEM</h2>" +
                "<hr style='border: 1px solid #eee;'>" +
                "<h3 style='color: #27ae60;'>Contribution Receipt</h3>" +
                "<p>Dear <strong>" + (memberName != null ? memberName : "Member") + ",</strong></p>" +
                "<p>Thank you for your contribution. Please find your receipt details below:</p>" +
                "<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>" +
                "<tr style='background-color: #f8f9fa;'>" +
                "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Receipt Number:</strong></td>" +
                "<td style='padding: 10px; border: 1px solid #ddd;'>" + (receiptNumber != null ? receiptNumber : "N/A") + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Amount:</strong></td>" +
                "<td style='padding: 10px; border: 1px solid #ddd;'>$" + (amount != null ? amount.toString() : "0.00") + "</td>" +
                "</tr>" +
                "</table>" +
                "<p>The receipt PDF is attached to this email for your records.</p>" +
                "<p>If you have any questions, please contact the church office.</p>" +
                "<hr style='border: 1px solid #eee;'>" +
                "<p style='text-align: center; color: #7f8c8d; font-size: 12px;'>" +
                "This is an automated message from " + appName + "</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildPasswordResetEmailContent(String resetToken, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #2c3e50; text-align: center;'>CHURCH FINANCIAL MANAGEMENT SYSTEM</h2>" +
                "<hr style='border: 1px solid #eee;'>" +
                "<h3 style='color: #e74c3c;'>Password Reset Request</h3>" +
                "<p>You have requested a password reset for your account.</p>" +
                "<p>Click the button below to reset your password:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + resetLink + "' style='background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>" +
                "</div>" +
                "<p style='color: #7f8c8d; font-size: 12px;'>If the button doesn't work, copy and paste this link into your browser:</p>" +
                "<p style='color: #3498db; font-size: 12px; word-break: break-all;'>" + resetLink + "</p>" +
                "<p><strong>This link will expire in 24 hours.</strong></p>" +
                "<p>If you did not request this reset, please ignore this email.</p>" +
                "<hr style='border: 1px solid #eee;'>" +
                "<p style='text-align: center; color: #7f8c8d; font-size: 12px;'>" +
                "This is an automated message from " + appName + "</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
