package com.example.ecp_api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryFilterRequest {
    private String name;
    private String parentId;
    private Integer level;
    private Boolean active;
}
