package com.example.ecp_api.service.helper;

import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

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
     * Check the validity of the category hierarchy (Maximum limit of 2 levels)
     * 1. A category that is already a parent (has children) cannot be assigned a parentId
     * 2. The assigned parent category must be a level 1 (without a parentId)
     * 3. A category cannot be its own parent or its descendants
     */
    public void validateHierarchy(String categoryId, String newParentId) {
        if (!StringUtils.hasText(newParentId)) {
            return;
        }

        // If updating: Prevent assign parent to child categories
        if (categoryId != null && categoryRepository.existsByParentIdAndDeletedFalse(categoryId)) {
            throw new AppException("Cannot assign a parent to a category that has sub-categories", HttpStatus.BAD_REQUEST);
        }

        // Prevent assigned its own
        if (newParentId.equals(categoryId)) {
            throw new AppException("Category cannot be its own parent", HttpStatus.BAD_REQUEST);
        }

        Category parent = getCategoryOrThrow(newParentId);

        // Two-level limitation: the selected parent cannot be a sub-category (one that already has a parent)
        if (StringUtils.hasText(parent.getParentId())) {
            throw new AppException("Parent category cannot be a sub-category", HttpStatus.BAD_REQUEST);
        }

        // Loop check: Parent must not be a descendant of the current category
        if (categoryId != null && parent.getPath() != null && parent.getPath().contains(categoryId)) {
            throw new AppException("Category cannot be a child of its own descendant", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Cập nhật thông tin phân cấp cho các category con trực tiếp của category cha.
     *
     * Khi category cha thay đổi level hoặc path (ví dụ đổi parent hoặc thay đổi vị trí trong cây),
     * các category con cũng cần được đồng bộ lại để đảm bảo cấu trúc cây chính xác.
     *
     * Chức năng:
     * - Tìm tất cả category con trực tiếp của parent (theo parentId)
     * - Bỏ qua các category đã bị soft delete
     * - Cập nhật level của child = level của parent + 1
     * - Cập nhật path để lưu chuỗi tổ tiên của category
     * - Lưu lại thay đổi vào database
     *
     * Lưu ý:
     * Hiện tại hàm này chỉ cập nhật các category con trực tiếp (1 cấp),
     * chưa xử lý đệ quy cho các cấp sâu hơn như cháu, chắt...
     *
     * @param parent category cha cần đồng bộ descendants
     */
    public void updateDescendants(Category parent) {
        List<Category> children = categoryRepository.findAll().stream()
                .filter(c -> parent.getId().equals(c.getParentId()) && !c.isDeleted())
                .toList();

        for (Category child : children) {
            child.setLevel(parent.getLevel() + 1);
            child.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
            categoryRepository.save(child);
        }
    }
}
