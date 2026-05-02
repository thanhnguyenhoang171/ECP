package com.example.ecp_api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    public void controllerPointcut() {
    }

    @Around("controllerPointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {

        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder
                        .currentRequestAttributes())
                        .getRequest();

        String className = joinPoint.getSignature()
                .getDeclaringType()
                .getSimpleName();

        String methodName = joinPoint.getSignature()
                .getName();

        Object[] filteredArgs = Arrays.stream(joinPoint.getArgs())
                .filter(arg -> !(arg instanceof HttpServletRequest))
                .filter(arg -> !(arg instanceof HttpServletResponse))
                .toArray();

        // ================================
        // REQUEST LOG
        // ================================
        log.info("""
                ==================================================
                >>> API REQUEST
                ==================================================
                HTTP Method   : {}
                Request URI   : {}
                Controller    : {}.{}
                ==================================================
                """,
                request.getMethod(),
                request.getRequestURI(),
                className,
                methodName
        );

        if (filteredArgs.length > 0) {
            try {
                log.info("""
                        Request Body:
                        {}
                        ==================================================
                        """,
                        objectMapper.writerWithDefaultPrettyPrinter()
                                .writeValueAsString(filteredArgs)
                );
            } catch (Exception e) {
                log.info("Request Body: {}", Arrays.toString(filteredArgs));
            }
        }

        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - start;

            // ================================
            // RESPONSE LOG
            // ================================
            try {
                log.info("""
                        ==================================================
                        <<< API RESPONSE
                        ==================================================
                        HTTP Method   : {}
                        Request URI   : {}
                        Execution Time: {} ms

                        Response Body:
                        {}
                        ==================================================
                        """,
                        request.getMethod(),
                        request.getRequestURI(),
                        executionTime,
                        objectMapper.writerWithDefaultPrettyPrinter()
                                .writeValueAsString(result)
                );
            } catch (Exception e) {
                log.info("""
                        ==================================================
                        <<< API RESPONSE
                        ==================================================
                        HTTP Method   : {}
                        Request URI   : {}
                        Execution Time: {} ms

                        Response Body:
                        {}
                        ==================================================
                        """,
                        request.getMethod(),
                        request.getRequestURI(),
                        executionTime,
                        result
                );
            }

            return result;

        } catch (Exception ex) {
            long executionTime = System.currentTimeMillis() - start;

            log.error("""
                    ==================================================
                    !!! API ERROR
                    ==================================================
                    HTTP Method   : {}
                    Request URI   : {}
                    Execution Time: {} ms
                    Error Message : {}
                    ==================================================
                    """,
                    request.getMethod(),
                    request.getRequestURI(),
                    executionTime,
                    ex.getMessage(),
                    ex
            );

            throw ex;
        }
    }
}
