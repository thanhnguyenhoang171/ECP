package com.example.ecp_api.controller.admin;

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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/v1/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Category Management", description = "Super Admin: Full CRUD on categories with audit info")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new category (JSON)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategoryJson(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category created successfully")
                .data(categoryService.createCategory(request, null)).build(), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new category (Multipart)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategoryMultipart(
            @RequestPart("category") @Valid CategoryRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return new ResponseEntity<>(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category created successfully")
                .data(categoryService.createCategory(request, imageFile)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all categories")
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

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category fetched successfully")
                .data(categoryService.getCategoryById(id)).build());
    }

    @GetMapping("/parents")
    @Operation(summary = "Get all top-level categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true).message("Parent categories fetched successfully")
                .data(categoryService.getParentCategories()).build());
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update a category (JSON)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryJson(
            @PathVariable String id, @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category updated successfully")
                .data(categoryService.updateCategory(id, request, null)).build());
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a category (Multipart)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryMultipart(
            @PathVariable String id,
            @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true).message("Category updated successfully")
                .data(categoryService.updateCategory(id, request, imageFile)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Category deleted successfully").build());
    }

    @GetMapping("/export")
    @Operation(summary = "Export categories to Excel")
    public ResponseEntity<StreamingResponseBody> exportToExcel() {
        String fileName = "Danh_sach_loai_hang_hoa.xlsx";
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        StreamingResponseBody body = out -> {
            try { categoryService.exportAllCategoriesToExcel(out); }
            catch (Exception e) { throw new IOException("Error during excel export", e); }
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(body);
    }

    @GetMapping("/template")
    @Operation(summary = "Download Excel import template")
    public ResponseEntity<StreamingResponseBody> downloadTemplate() {
        String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("ddMMyyyy"));
        String fileName = "Template_Import_Category_" + dateStr + ".xlsx";
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        StreamingResponseBody body = out -> {
            try { categoryService.downloadCategoryTemplate(out); }
            catch (Exception e) { throw new IOException("Error during template download", e); }
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(body);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import categories from Excel")
    public ResponseEntity<ApiResponse<Void>> importCategories(@RequestParam("file") MultipartFile file) {
        categoryService.importCategoriesFromExcel(file);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Categories imported successfully").build());
    }
}
