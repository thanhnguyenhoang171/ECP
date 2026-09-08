package com.example.ecp_api.config;

import com.example.ecp_api.dto.view.Views;
import com.example.ecp_api.util.SecurityUtils;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.AbstractMappingJacksonResponseBodyAdvice;

/**
 * Controller advice to dynamically set Jackson serialization view based on the current user's role.
 * - Admin/Manager: Views.Admin (includes audit fields like createdBy, updatedBy)
 * - Public/Storefront/Others: Views.Public (omits audit/internal fields)
 */
@ControllerAdvice
public class RoleBasedJsonViewAdvice extends AbstractMappingJacksonResponseBodyAdvice {

    @Override
    protected void beforeBodyWriteInternal(
            MappingJacksonValue bodyContainer,
            MediaType contentType,
            MethodParameter returnType,
            ServerHttpRequest request,
            ServerHttpResponse response) {

        if (SecurityUtils.isSuperAdmin()) {
            bodyContainer.setSerializationView(Views.Admin.class);
        } else {
            bodyContainer.setSerializationView(Views.Public.class);
        }
    }
}
