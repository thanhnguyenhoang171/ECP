package com.example.ecp_api.service.impl;

import com.example.ecp_api.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.sender-name:Cacao Shop}")
    private String senderName;

    @Override
    @Async // Gửi mail bất đồng bộ để API response ngay lập tức
    public void sendOtpEmail(String toEmail, String fullName, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(toEmail);
            helper.setSubject("[Cacao Shop] Mã xác thực Email của bạn");

           Context context = new Context();
           context.setVariable("fullName", fullName);
           context.setVariable("otpCode", otpCode);
           context.setVariable("expireMinutes", 10);

           String htmlContext = templateEngine.process("emails/verify-email", context);

            helper.setText(htmlContext, true);

            mailSender.send(message);

            log.info("Successfully sent verification OTP email to {}", toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }
}