package com.example.ecp_api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class
TelegramNotificationService {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${telegram.chat.id:}")
    private String chatId;

    @Value("${telegram.enabled:true}")
    private boolean enabled;

    @Value("${spring.application.name:ecp_api}")
    private String appName;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendErrorLogAsync(String path, Throwable throwable) {
        if (!enabled || botToken == null || botToken.trim().isEmpty() || chatId == null || chatId.trim().isEmpty()) {
            return;
        }

        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String exceptionClass = throwable.getClass().getName();
            String errorMessage = throwable.getMessage() != null ? throwable.getMessage() : "No detail message";
            String stackTrace = getTruncatedStackTrace(throwable, 12);

            String text = String.format(
                    "🚨 <b>[CRITICAL SYSTEM ERROR]</b>\n\n" +
                    "<b>App:</b> <code>%s</code> (%s)\n" +
                    "<b>Time:</b> <code>%s</code>\n" +
                    "<b>Path:</b> <code>%s</code>\n" +
                    "<b>Exception:</b> <code>%s</code>\n" +
                    "<b>Message:</b> %s\n\n" +
                    "<b>StackTrace:</b>\n<pre>%s</pre>",
                    escapeHtml(appName),
                    escapeHtml(activeProfile),
                    escapeHtml(timestamp),
                    escapeHtml(path),
                    escapeHtml(exceptionClass),
                    escapeHtml(errorMessage),
                    escapeHtml(stackTrace)
            );

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", "HTML");
            body.put("disable_web_page_preview", true);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, String.class);
            log.info("Telegram error alert sent successfully for path: {}", path);
        } catch (Exception e) {
            log.error("Failed to send error notification to Telegram: {}", e.getMessage());
        }
    }

    private String getTruncatedStackTrace(Throwable throwable, int maxLines) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        String fullStackTrace = sw.toString();

        String[] lines = fullStackTrace.split("\r?\n");
        StringBuilder sb = new StringBuilder();
        int count = Math.min(lines.length, maxLines);
        for (int i = 0; i < count; i++) {
            sb.append(lines[i]).append("\n");
        }
        if (lines.length > maxLines) {
            sb.append("... ").append(lines.length - maxLines).append(" more lines truncated");
        }
        return sb.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }
}
