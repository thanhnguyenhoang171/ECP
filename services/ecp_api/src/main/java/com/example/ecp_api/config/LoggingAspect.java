package com.example.ecp_api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final ObjectMapper objectMapper;

    @Pointcut("within(com.example.ecp_api.controller..*)")
    public void controllerPointcut() {}

    @Around("controllerPointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        Object[] args = joinPoint.getArgs();

        log.info(">>> API Request: [{} {}] | Method: {}.{}", 
                request.getMethod(), request.getRequestURI(), className, methodName);
        
        if (args != null && args.length > 0) {
            try {
                log.info(">>> Input: {}", objectMapper.writeValueAsString(args));
            } catch (Exception e) {
                log.info(">>> Input: {}", Arrays.toString(args));
            }
        }

        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - start;

        try {
            log.info("<<< API Response: [{} {}] | Time: {}ms | Result: {}", 
                    request.getMethod(), request.getRequestURI(), executionTime, objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            log.info("<<< API Response: [{} {}] | Time: {}ms | Result: {}", 
                    request.getMethod(), request.getRequestURI(), executionTime, result);
        }

        return result;
    }
}
