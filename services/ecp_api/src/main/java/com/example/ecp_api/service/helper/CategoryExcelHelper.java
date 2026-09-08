package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.excel.CategoryExcelDto;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.util.SlugUtils;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import com.example.ecp_api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class CategoryExcelHelper {

    private final CategoryRepository categoryRepository;
    private final CategoryHelper categoryHelper;
    private final CloudinaryService cloudinaryService;

    public void upsertCategoryForImport(CategoryExcelDto dto) {
        // 0. Validate required fields
        if (!StringUtils.hasText(dto.getName())) {
            throw new AppException("NAME_REQUIRED", "Column 'Category Name' cannot be empty", HttpStatus.BAD_REQUEST);
        }

        Category existingCategory = null;

        // 1. Find by ID
        if (StringUtils.hasText(dto.getId())) {
            existingCategory = categoryRepository.findById(dto.getId())
                    .filter(c -> !c.isDeleted())
                    .orElse(null);
        }

        // 2. Find by Slug if ID is empty or not found
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

        // Update basic fields
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        String slugToUse = StringUtils.hasText(dto.getSlug()) ? dto.getSlug() : SlugUtils.toSlug(dto.getName());
        
        // Check slug uniqueness
        if (!slugToUse.equals(category.getSlug()) && categoryRepository.existsBySlugAndDeletedFalse(slugToUse)) {
            throw new AppException("CATEGORY_SLUG_EXISTS", "Category slug '" + slugToUse + "' already exists", HttpStatus.BAD_REQUEST);
        }
        category.setSlug(slugToUse);
        category.setActive(true);
        category.setOrder(dto.getOrder() != null ? dto.getOrder() : 1);
        category.setDeleted(false);

        // Process image (Embedded image -> URL)
        if (dto.getEmbeddedImageBytes() != null && dto.getEmbeddedImageBytes().length > 0) {
            CloudinaryAsset asset = cloudinaryService.uploadSafely(dto.getEmbeddedImageBytes(), "categories");
            if (asset == null) {
                throw new AppException("IMAGE_UPLOAD_FAILED",
                        "Failed to upload image to Cloudinary for category: '" + dto.getName() + "'. Please check Cloudinary configuration or network connection.",
                        HttpStatus.BAD_REQUEST);
            }
            category.setImage(ProductImage.builder()
                    .url(asset.url())
                    .publicId(asset.publicId())
                    .build());
        } else if (StringUtils.hasText(dto.getImageUrl())) {
            CloudinaryAsset asset = cloudinaryService.uploadFromUrlSafely(dto.getImageUrl(), "categories");
            if (asset != null) {
                category.setImage(ProductImage.builder()
                        .url(asset.url())
                        .publicId(asset.publicId())
                        .build());
            } else if (dto.getImageUrl().trim().startsWith("http")) {
                category.setImage(ProductImage.builder()
                        .url(dto.getImageUrl().trim())
                        .build());
            }
        }

        // Process hierarchy (Parent)
        String oldParentId = category.getParentId();
        boolean parentChanged = false;

        if (StringUtils.hasText(dto.getParentSlug())) {
            Category parent = categoryRepository.findBySlugAndDeletedFalse(dto.getParentSlug())
                    .orElseThrow(() -> new AppException("PARENT_NOT_FOUND", "Parent slug '" + dto.getParentSlug() + "': Category not found", HttpStatus.BAD_REQUEST));
            
            if (!parent.getId().equals(oldParentId)) {
                if (!isNew) {
                    try {
                        categoryHelper.validateHierarchy(category.getId(), parent.getId());
                    } catch (AppException e) {
                        throw new AppException(e.getCode(), "Parent category: " + e.getMessage(), e.getStatus());
                    }
                }
                category.setParentId(parent.getId());
                category.setLevel(parent.getLevel() + 1);
                parentChanged = true;
            }
        } else {
            if (oldParentId != null || isNew) {
                category.setParentId(null);
                category.setLevel(1);
                parentChanged = true;
            }
        }

        Category saved = categoryRepository.save(category);

        // Nếu thay đổi cha, cập nhật lại level cho toàn bộ con cháu
        if (parentChanged && !isNew) {
            categoryHelper.updateDescendants(saved);
        }
    }
}
