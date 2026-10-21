package com.example.ecp_api.config;

import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {
    private final AuditLogService auditLogService;

    @Around("within(com.example.ecp_api.controller..*)")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) { return joinPoint.proceed(); }
        var request = attributes.getRequest();
        long start = System.currentTimeMillis();
        int status = 500;
        boolean failed = true;
        try {
            Object result = joinPoint.proceed();
            HttpServletResponse response = attributes.getResponse();
            status = result instanceof ResponseEntity<?> entity ? entity.getStatusCode().value()
                    : response != null ? response.getStatus() : 200;
            failed = status >= 400;
            return result;
        } finally {
            long duration = System.currentTimeMillis() - start;
            String details = request.getMethod() + " " + request.getRequestURI() + " | "
                    + (failed ? "FAILED" : "HTTP " + status) + " | " + duration + " ms";
            // Never record bodies, cookies, query parameters, passwords or JWTs.
            log.info("API {}", details);
            // Reading/deleting audit records must not create an endless stream of API entries.
            if (!request.getServletPath().equals("/v1/audit-logs") && !request.getServletPath().startsWith("/v1/audit-logs/")) {
                try {
                    auditLogService.log("API_REQUEST", SecurityUtils.getCurrentUserEmail(), details, failed ? "FAILURE" : "SUCCESS");
                } catch (Exception error) {
                    log.error("Could not persist API audit entry: {}", error.getMessage());
                }
            }
        }
    }
}
