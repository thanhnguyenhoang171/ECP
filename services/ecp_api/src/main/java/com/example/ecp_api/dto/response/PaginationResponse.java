package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse {
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean isLast;
    private boolean isFirst;
}
