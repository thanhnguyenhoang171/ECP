package com.example.ecp_api.controller.manager;

import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/manager/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Category Management", description = "Manager: CRUD on categories. Response excludes audit fields.")
public class ManagerCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category created successfully")
                .data(categoryService.createCategory(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all categories with filtering")
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
    @Operation(summary = "Get all top-level (parent) categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true).message("Parent categories fetched successfully")
                .data(categoryService.getParentCategories()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category fetched successfully")
                .data(categoryService.getCategoryById(id)).build());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id, @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category updated successfully")
                .data(categoryService.updateCategory(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Category deleted successfully").build());
    }
}
