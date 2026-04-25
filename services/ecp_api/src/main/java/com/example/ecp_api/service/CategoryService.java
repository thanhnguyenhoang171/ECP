package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    PageResponse<CategoryResponse> getAllCategories(Pageable pageable);
    List<CategoryResponse> getParentCategories();
    void deleteCategory(String id);
}
