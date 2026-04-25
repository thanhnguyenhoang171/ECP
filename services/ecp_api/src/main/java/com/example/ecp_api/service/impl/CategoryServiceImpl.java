package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.CategoryMapper;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException("Category with Slug already exists", HttpStatus.BAD_REQUEST);
        }

        Category category = categoryMapper.toEntity(request);
        category.setActive(request.getIsActive() == null || request.getIsActive());

        if (request.getParentId() != null && !request.getParentId().isEmpty()) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found with id: " + request.getParentId()));
            
            category.setLevel(parent.getLevel() + 1);
            category.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
        } else {
            category.setLevel(1);
            category.setPath(null);
        }

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(categoryMapper::toResponse);
    }
}
