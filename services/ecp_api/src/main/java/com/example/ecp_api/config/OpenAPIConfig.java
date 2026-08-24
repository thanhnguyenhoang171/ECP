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
                                ## Clean RESTful PBAC & Multi-Role API Specification
                                
                                This API documentation is organized by clean domain resources (`/v1/...`).
                                
                                | Group | Scope | Base Path | Description |
                                |-------|-------|-----------|-------------|
                                | **0-auth** | Public Authentication | `/v1/auth/**` | Register, Login, Refresh Token, Google OAuth |
                                | **1-management** | Business & System Management | `/v1/products/**`, `/v1/categories/**`, `/v1/brands/**`, `/v1/skus/**`, `/v1/users/**`, `/v1/roles/**`, `/v1/inventory/**`, `/v1/suppliers/**`, `/v1/warehouses/**`, `/v1/purchase-orders/**`, `/v1/goods-receipts/**`, `/v1/audit-logs/**`, `/v1/system/**`, `/v1/files/**` | Granular PBAC protected management APIs |
                                | **2-storefront** | E-Commerce Storefront | `/v1/storefront/**` | End Users & Customers catalog features |
                                | **3-all-apis** | Full System Reference | `/**` | All Endpoints |
                                
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
     * Group 0: Auth APIs
     */
    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("0-auth")
                .pathsToMatch("/v1/auth/**")
                .build();
    }

    /**
     * Group 1: Management APIs (Products, Categories, Brands, SKUs, Users, Roles, Inventory, etc.)
     */
    @Bean
    public GroupedOpenApi managementApi() {
        return GroupedOpenApi.builder()
                .group("1-management")
                .pathsToMatch(
                        "/v1/products/**",
                        "/v1/categories/**",
                        "/v1/brands/**",
                        "/v1/skus/**",
                        "/v1/users/**",
                        "/v1/roles/**",
                        "/v1/inventory/**",
                        "/v1/suppliers/**",
                        "/v1/warehouses/**",
                        "/v1/purchase-orders/**",
                        "/v1/goods-receipts/**",
                        "/v1/audit-logs/**",
                        "/v1/system/**",
                        "/v1/files/**"
                )
                .build();
    }

    /**
     * Group 2: Storefront APIs
     */
    @Bean
    public GroupedOpenApi storefrontApi() {
        return GroupedOpenApi.builder()
                .group("2-storefront")
                .pathsToMatch("/v1/storefront/**")
                .build();
    }

    /**
     * Group 3: All APIs
     */
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("3-all-apis")
                .pathsToMatch("/**")
                .build();
    }
}
