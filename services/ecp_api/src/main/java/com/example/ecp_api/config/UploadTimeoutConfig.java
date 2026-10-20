package com.example.ecp_api.config;

import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class UploadTimeoutConfig {

    @Bean
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> uploadTimeoutCustomizer(
            @Value("${app.upload.read-timeout-ms:300000}") int readTimeoutMs) {
        if (readTimeoutMs <= 0) {
            throw new IllegalArgumentException("app.upload.read-timeout-ms must be positive");
        }
        return factory -> factory.addConnectorCustomizers(connector -> {
            if (connector.getProtocolHandler() instanceof AbstractHttp11Protocol<?> protocol) {
                // Otherwise Tomcat uses the ordinary connection timeout while reading uploads.
                protocol.setDisableUploadTimeout(false);
                protocol.setConnectionUploadTimeout(readTimeoutMs);
            }
        });
    }
}
