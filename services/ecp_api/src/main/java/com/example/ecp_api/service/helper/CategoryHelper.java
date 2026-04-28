package com.example.ecp_api.service.helper;

import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class CategoryHelper {

    private final CategoryRepository categoryRepository;

    public Category getCategoryOrThrow(String id) {
        return categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or deleted with id: " + id));
    }

    /**
     * Kiểm tra tính hợp lệ của phân cấp danh mục (Giới hạn tối đa 2 cấp)
     * 1. Một danh mục đang là cha (có con) thì không được phép gán parentId.
     * 2. Danh mục cha được gán phải là danh mục cấp 1 (không có parentId).
     * 3. Danh mục không được là cha của chính mình hoặc con cháu của mình.
     */
    public void validateHierarchy(String categoryId, String newParentId) {
        if (!StringUtils.hasText(newParentId)) {
            return;
        }

        // 1. Nếu đang update: Chặn không cho gán parent cho danh mục đã có con
        if (categoryId != null && categoryRepository.existsByParentIdAndDeletedFalse(categoryId)) {
            throw new AppException("Cannot assign a parent to a category that has sub-categories", HttpStatus.BAD_REQUEST);
        }

        // 2. Chặn không cho gán chính mình làm cha
        if (newParentId.equals(categoryId)) {
            throw new AppException("Category cannot be its own parent", HttpStatus.BAD_REQUEST);
        }

        Category parent = getCategoryOrThrow(newParentId);

        // 3. Giới hạn 2 cấp: Parent được chọn không được là một sub-category (đã có parent)
        if (StringUtils.hasText(parent.getParentId())) {
            throw new AppException("Parent category cannot be a sub-category", HttpStatus.BAD_REQUEST);
        }

        // 4. Kiểm tra vòng lặp: Parent không được là con cháu của danh mục hiện tại
        if (categoryId != null && parent.getPath() != null && parent.getPath().contains(categoryId)) {
            throw new AppException("Category cannot be a child of its own descendant", HttpStatus.BAD_REQUEST);
        }
    }
}
