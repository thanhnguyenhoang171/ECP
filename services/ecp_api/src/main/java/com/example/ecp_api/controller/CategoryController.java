package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // API CREATE A NEW CATEGORY
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        ApiResponse<CategoryResponse> apiResponse = ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category created successfully")
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    // API GET CATEGORY LIST WITH PAGINATION
    @GetMapping
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(
            CategoryFilterRequest filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(filter, pageable));
    }

    // API GET CATEGORY DETAIL
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable("id") String id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        ApiResponse<CategoryResponse> apiResponse = ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category fetched successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    // API GET PARENT CATEGORY LIST
    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getParentCategories() {
        List<CategoryResponse> responses = categoryService.getParentCategories();
        ApiResponse<List<CategoryResponse>> apiResponse = ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .message("Parent categories fetched successfully")
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    // API UPDATE A CATEGORY
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable("id") String id,
            @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        ApiResponse<CategoryResponse> apiResponse = ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    // API DELETE A CATEGORY
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("id") String id) {
        categoryService.deleteCategory(id);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Category deleted successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/export")
    public ResponseEntity<StreamingResponseBody> exportToExcel() {
        String fileName = "Danh_sach_loai_hang_hoa.xlsx";
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        StreamingResponseBody responseBody = outputStream -> {
            try {
                categoryService.exportAllCategoriesToExcel(outputStream);
            } catch (Exception e) {
                throw new IOException("Error during excel export", e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(responseBody);
    }
//
//    @GetMapping("/template")
//    public ResponseEntity<StreamingResponseBody> downloadTemplate() {
//        String fileName = "Template_Import_Category.xlsx";
//        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
//
//        StreamingResponseBody responseBody = outputStream -> {
//            try {
//                categoryService.downloadCategoryTemplate(outputStream);
//            } catch (Exception e) {
//                throw new IOException("Error during template download", e);
//            }
//        };
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
//                .body(responseBody);
//    }

}
