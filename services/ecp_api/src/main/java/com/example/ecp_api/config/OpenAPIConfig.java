package com.example.ecp_api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("ECP E-Commerce Platform API Documentation")
                        .version("1.0.0")
                        .description("API Documentation grouped by user role and functional area")
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

    @Bean
    public GroupedOpenApi commonApi() {
        return GroupedOpenApi.builder()
                .group("0-common-auth")
                .pathsToMatch("/auth/**", "/v1/test/**", "/v1/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi superAdminApi() {
        return GroupedOpenApi.builder()
                .group("1-super-admin")
                .pathsToMatch("/**/admin/**", "/v1/audit-logs/**")
                .build();
    }

    @Bean
    public GroupedOpenApi managerApi() {
        return GroupedOpenApi.builder()
                .group("2-manager")
                .pathsToMatch(
                        "/v1/purchase-orders/**",
                        "/v1/goods-receipts/**",
                        "/v1/suppliers/**",
                        "/v1/warehouses/**",
                        "/v1/inventory/**",
                        "/v1/skus/**"
                )
                .pathsToExclude("/**/admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("3-user-storefront")
                .pathsToMatch(
                        "/v1/products/**",
                        "/v1/categories/**",
                        "/v1/brands/**",
                        "/v1/cart/**",
                        "/v1/orders/**"
                )
                .pathsToExclude("/**/admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("4-all-apis")
                .pathsToMatch("/**")
                .build();
    }
}
