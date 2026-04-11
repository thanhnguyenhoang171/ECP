package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    AuditLogResponse toResponse(AuditLog auditLog);
}
