package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

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

    @GetMapping
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(pageable));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("id") String id) {
        categoryService.deleteCategory(id);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Category deleted successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
