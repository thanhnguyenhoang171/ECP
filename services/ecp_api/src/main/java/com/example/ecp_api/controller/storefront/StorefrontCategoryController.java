package com.example.ecp_api.controller.storefront;

import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/storefront/categories")
@RequiredArgsConstructor
@Tag(name = "[STOREFRONT] Category", description = "Public Storefront API for viewing categories")
public class StorefrontCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active categories for storefront navigation")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(
            CategoryFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(filter, pageable));
    }

    @GetMapping("/parents")
    @Operation(summary = "Get top-level categories for main menu")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true).message("Parent categories fetched successfully")
                .data(categoryService.getParentCategories()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category details by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category fetched successfully")
                .data(categoryService.getCategoryById(id)).build());
    }
}
