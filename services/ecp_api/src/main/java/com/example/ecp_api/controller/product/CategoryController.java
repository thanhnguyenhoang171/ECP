package com.example.ecp_api.controller.product;

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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('category:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Categories", description = "Category Management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('category:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new category (JSON)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategoryJson(
            @Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code("CATEGORY_CREATED_SUCCESS")
                .message("Category created successfully")
                .data(categoryService.createCategory(request, null)).build(), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('category:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new category (Multipart)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategoryMultipart(
            @RequestPart("category") @Valid CategoryRequest request,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile) {
        return new ResponseEntity<>(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code("CATEGORY_CREATED_SUCCESS")
                .message("Category created successfully")
                .data(categoryService.createCategory(request, iconFile)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get categories with pagination and filtering")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "displayOrder,asc")
    })
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(
            CategoryFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "displayOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(filter, pageable));
    }

    @GetMapping("/parents")
    @Operation(summary = "Get root parent categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .code("PARENT_CATEGORIES_FETCHED_SUCCESS")
                .message("Parent categories fetched successfully")
                .data(categoryService.getParentCategories()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category details by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code("CATEGORY_FETCHED_SUCCESS")
                .message("Category fetched successfully")
                .data(categoryService.getCategoryById(id)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('category:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update category details (JSON)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryJson(
            @PathVariable String id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code("CATEGORY_UPDATED_SUCCESS")
                .message("Category updated successfully")
                .data(categoryService.updateCategory(id, request, null)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('category:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update category details (Multipart)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryMultipart(
            @PathVariable String id,
            @RequestPart("category") @Valid CategoryRequest request,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .code("CATEGORY_UPDATED_SUCCESS")
                .message("Category updated successfully")
                .data(categoryService.updateCategory(id, request, iconFile)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('category:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete category by ID")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("CATEGORY_DELETED_SUCCESS")
                .message("Category deleted successfully").build());
    }
}
