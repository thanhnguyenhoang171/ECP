package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.excel.CategoryExcelDto;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class CategoryExcelHelper {

    private final CategoryRepository categoryRepository;
    private final CategoryHelper categoryHelper;

    public void upsertCategoryForImport(CategoryExcelDto dto) {
        // 0. Kiểm tra các trường bắt buộc
        if (!StringUtils.hasText(dto.getName())) {
            throw new AppException("NAME_REQUIRED", "Cột 'Tên danh mục' không được để trống", HttpStatus.BAD_REQUEST);
        }

        Category existingCategory = null;
        // ... (giữ nguyên logic tìm kiếm ID/Slug)

        // 1. Tìm theo ID
        if (StringUtils.hasText(dto.getId())) {
            existingCategory = categoryRepository.findById(dto.getId())
                    .filter(c -> !c.isDeleted())
                    .orElse(null);
        }

        // 2. Tìm theo Slug nếu ID không tồn tại hoặc trống
        if (existingCategory == null && StringUtils.hasText(dto.getSlug())) {
            existingCategory = categoryRepository.findBySlugAndDeletedFalse(dto.getSlug())
                    .orElse(null);
        }

        Category category;
        boolean isNew = false;

        if (existingCategory != null) {
            category = existingCategory;
        } else {
            category = new Category();
            if (StringUtils.hasText(dto.getId())) {
                category.setId(dto.getId());
            }
            isNew = true;
        }

        // Cập nhật thông tin cơ bản
        category.setName(dto.getName());
        String slugToUse = StringUtils.hasText(dto.getSlug()) ? dto.getSlug() : SlugUtils.toSlug(dto.getName());
        
        // Kiểm tra trùng Slug nếu slug thay đổi hoặc là tạo mới
        if (!slugToUse.equals(category.getSlug()) && categoryRepository.existsBySlugAndDeletedFalse(slugToUse)) {
            throw new AppException("CATEGORY_SLUG_EXISTS", "Cột 'Slug': '" + slugToUse + "' đã tồn tại hệ thống", HttpStatus.BAD_REQUEST);
        }
        category.setSlug(slugToUse);
        category.setActive(dto.getStatus() != null ? dto.getStatus() : true);
        category.setDeleted(false);

        // 0.1 Xử lý Ngày tạo / Ngày sửa (nếu có trong file Excel)
        if (StringUtils.hasText(dto.getCreatedAt())) {
            java.time.LocalDateTime createdAt = com.example.ecp_api.util.DateTimeUtils.parse(dto.getCreatedAt());
            if (createdAt == null) {
                throw new AppException("INVALID_DATE_FORMAT", "Cột 'Ngày tạo': Định dạng ngày không hợp lệ (Yêu cầu: dd/MM/yyyy HH:mm:ss)", HttpStatus.BAD_REQUEST);
            }
            category.setCreatedAt(createdAt);
        }

        if (StringUtils.hasText(dto.getUpdatedAt())) {
            java.time.LocalDateTime updatedAt = com.example.ecp_api.util.DateTimeUtils.parse(dto.getUpdatedAt());
            if (updatedAt == null) {
                throw new AppException("INVALID_DATE_FORMAT", "Cột 'Ngày sửa': Định dạng ngày không hợp lệ (Yêu cầu: dd/MM/yyyy HH:mm:ss)", HttpStatus.BAD_REQUEST);
            }
            category.setUpdatedAt(updatedAt);
        }

        // Xử lý phân cấp (Parent)
        String oldParentId = category.getParentId();
        boolean parentChanged = false;

        if (StringUtils.hasText(dto.getParentSlug())) {
            Category parent = categoryRepository.findBySlugAndDeletedFalse(dto.getParentSlug())
                    .orElseThrow(() -> new AppException("PARENT_NOT_FOUND", "Cột 'Slug danh mục cha': Không tìm thấy danh mục với slug '" + dto.getParentSlug() + "'", HttpStatus.BAD_REQUEST));
            
            if (!parent.getId().equals(oldParentId)) {
                if (!isNew) {
                    try {
                        categoryHelper.validateHierarchy(category.getId(), parent.getId());
                    } catch (AppException e) {
                        throw new AppException(e.getCode(), "Cột 'Slug danh mục cha': " + e.getMessage(), e.getStatus());
                    }
                }
                category.setParentId(parent.getId());
                category.setLevel(parent.getLevel() + 1);
                category.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
                parentChanged = true;
            }
        } else {
            if (oldParentId != null || isNew) {
                category.setParentId(null);
                category.setLevel(1);
                category.setPath(null);
                parentChanged = true;
            }
        }

        Category saved = categoryRepository.save(category);

        // Cập nhật Path cho root category nếu là tạo mới
        if (isNew && !StringUtils.hasText(saved.getParentId())) {
            saved.setPath(saved.getId());
            saved = categoryRepository.save(saved);
        }

        // Nếu thay đổi cha, cập nhật lại path/level cho toàn bộ con cháu
        if (parentChanged && !isNew) {
            categoryHelper.updateDescendants(saved);
        }
    }
}
