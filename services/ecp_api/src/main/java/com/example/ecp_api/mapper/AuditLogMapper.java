package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.entity.mongodb.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AuditLogMapper {
    // Mapping for AuditLog
    AuditLogResponse toResponse(AuditLog auditLog);

    default PageResponse<AuditLogResponse> toPageResponse(Page<AuditLog> page) {
        List<AuditLogResponse> list = page.getContent().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());

        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<AuditLogResponse>builder()
                .success(true)
                .message("Fetch audit logs successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
