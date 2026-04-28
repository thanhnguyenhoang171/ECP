package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(String id, CategoryRequest request);
    CategoryResponse getCategoryById(String id);
    PageResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter, Pageable pageable);
    List<CategoryResponse> getParentCategories();
    void deleteCategory(String id);
    void exportCategoriesToExcel(OutputStream outputStream, List<CategoryResponse> categories) throws IOException;
    void exportAllToExcel(OutputStream outputStream) throws IOException;
    void downloadCategoryTemplate(OutputStream outputStream) throws IOException;
}
