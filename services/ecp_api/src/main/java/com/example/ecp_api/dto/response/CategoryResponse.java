package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private String id;
    private String name;
    private String slug;
    private String parentId;
    private String path;
    private int level;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
