package com.example.ecp_api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("/api").description("Default API URL")
                ))
                .info(new Info()
                        .title("ECP E-Commerce Platform API Documentation")
                        .version("1.0.0")
                        .description("""
                                ## Role-Based Access Control (RBAC) API Specification
                                
                                This API documentation is organized strictly by User Role and Functional Scope using RESTful versioning (`/v1/...`).
                                
                                | Group | Scope | Base Path | Target Audience |
                                |-------|-------|-----------|-----------------|
                                | **0-common** | Public Auth & Common Profile | `/v1/auth/**`, `/v1/common/**` | Public & All Authenticated Users |
                                | **1-super-admin** | System Administration | `/v1/admin/**` | `SUPER_ADMIN` Only |
                                | **2-manager** | Business Management | `/v1/manager/**` | `MANAGER` & `SUPER_ADMIN` |
                                | **3-storefront** | E-Commerce Storefront | `/v1/storefront/**` | End Users & Customers |
                                | **4-all-apis** | Full System Reference | `/**` | All Endpoints |
                                
                                ### Authentication Instructions
                                1. Login via `POST /v1/auth/login` to obtain an Access Token.
                                2. Click the **Authorize** button above and paste your token in format: `Bearer <your-token>`.
                                """)
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    /**
     * Group 0: Common APIs (Auth, User Profile, File Operations)
     * Paths: /v1/auth/**, /v1/common/**
     */
    @Bean
    public GroupedOpenApi commonApi() {
        return GroupedOpenApi.builder()
                .group("0-common")
                .pathsToMatch("/v1/auth/**", "/v1/common/**")
                .build();
    }

    /**
     * Group 1: Super Admin APIs (Full system access, includes audit info)
     * Paths: /v1/admin/**
     */
    @Bean
    public GroupedOpenApi superAdminApi() {
        return GroupedOpenApi.builder()
                .group("1-super-admin")
                .pathsToMatch("/v1/admin/**")
                .build();
    }

    /**
     * Group 2: Manager APIs (Business management, hides createdBy/updatedBy)
     * Paths: /v1/manager/**
     */
    @Bean
    public GroupedOpenApi managerApi() {
        return GroupedOpenApi.builder()
                .group("2-manager")
                .pathsToMatch("/v1/manager/**")
                .build();
    }

    /**
     * Group 3: Storefront APIs (Public catalog & customer features)
     * Paths: /v1/storefront/**
     */
    @Bean
    public GroupedOpenApi storefrontApi() {
        return GroupedOpenApi.builder()
                .group("3-storefront")
                .pathsToMatch("/v1/storefront/**")
                .build();
    }

    /**
     * Group 4: All APIs (Complete Reference)
     */
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("4-all-apis")
                .pathsToMatch("/**")
                .build();
    }
}
