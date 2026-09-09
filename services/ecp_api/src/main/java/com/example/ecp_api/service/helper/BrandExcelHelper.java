package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.excel.BrandExcelDto;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.entity.mongodb.Brand;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.mongodb.BrandRepository;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class BrandExcelHelper {

    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;

    public void upsertBrandForImport(BrandExcelDto dto) {
        // 1. Validate required fields
        if (!StringUtils.hasText(dto.getName())) {
            throw new AppException("NAME_REQUIRED", "Column 'Brand Name' cannot be empty", HttpStatus.BAD_REQUEST);
        }

        Brand existingBrand = null;

        // 2. Find by ID if provided
        if (StringUtils.hasText(dto.getId())) {
            existingBrand = brandRepository.findById(dto.getId())
                    .filter(b -> !b.isDeleted())
                    .orElse(null);
        }

        // 3. Find by Slug if ID is empty or not found
        if (existingBrand == null && StringUtils.hasText(dto.getSlug())) {
            existingBrand = brandRepository.findBySlugAndDeletedFalse(dto.getSlug())
                    .orElse(null);
        }

        Brand brand;
        boolean isNew = false;

        if (existingBrand != null) {
            brand = existingBrand;
        } else {
            brand = new Brand();
            if (StringUtils.hasText(dto.getId())) {
                brand.setId(dto.getId());
            }
            isNew = true;
        }

        // 4. Normalize name and Slug
        String trimmedName = dto.getName().trim();
        String slugToUse = StringUtils.hasText(dto.getSlug()) ? dto.getSlug().trim() : SlugUtils.toSlug(trimmedName);

        // 5. Validate Name & Slug uniqueness
        boolean nameExists = isNew
                ? brandRepository.existsByNameAndDeletedFalse(trimmedName)
                : brandRepository.existsByNameAndIdNotAndDeletedFalse(trimmedName, brand.getId());
        if (nameExists) {
            throw new AppException("BRAND_NAME_EXISTS", "Brand name '" + trimmedName + "' already exists", HttpStatus.BAD_REQUEST);
        }

        boolean slugExists = isNew
                ? brandRepository.existsBySlugAndDeletedFalse(slugToUse)
                : brandRepository.existsBySlugAndIdNotAndDeletedFalse(slugToUse, brand.getId());
        if (slugExists) {
            throw new AppException("BRAND_SLUG_EXISTS", "Brand slug '" + slugToUse + "' already exists", HttpStatus.BAD_REQUEST);
        }

        // 6. Update basic fields
        brand.setName(trimmedName);
        brand.setDescription(dto.getDescription());
        brand.setWebsite(dto.getWebsite());
        brand.setSlug(slugToUse);
        brand.setActive(dto.getActive() != null ? dto.getActive() : true);
        brand.setDeleted(false);

        // 7. Process Logo (Embedded image -> URL)
        String oldLogo = brand.getLogo();
        if (dto.getEmbeddedImageBytes() != null && dto.getEmbeddedImageBytes().length > 0) {
            CloudinaryAsset asset = cloudinaryService.uploadSafely(dto.getEmbeddedImageBytes(), "brands");
            if (asset == null) {
                throw new AppException("IMAGE_UPLOAD_FAILED",
                        "Failed to upload image to Cloudinary for brand: '" + dto.getName() + "'. Please check Cloudinary configuration or network connection.",
                        HttpStatus.BAD_REQUEST);
            }
            brand.setLogo(asset.url());
            if (StringUtils.hasText(oldLogo) && !oldLogo.equals(asset.url())) {
                cloudinaryService.deleteByUrl(oldLogo);
            }
        } else if (StringUtils.hasText(dto.getLogo())) {
            CloudinaryAsset asset = cloudinaryService.uploadFromUrlSafely(dto.getLogo(), "brands");
            if (asset != null) {
                brand.setLogo(asset.url());
                if (StringUtils.hasText(oldLogo) && !oldLogo.equals(asset.url())) {
                    cloudinaryService.deleteByUrl(oldLogo);
                }
            } else if (dto.getLogo().trim().startsWith("http")) {
                brand.setLogo(dto.getLogo().trim());
            }
        }

        // 8. Audit logs
        String currentUser = SecurityUtils.getCurrentUserEmail();
        if (isNew) {
            brand.setCreatedBy(currentUser);
        }
        brand.setUpdatedBy(currentUser);

        // 9. Lưu vào DB
        brandRepository.save(brand);
    }
}
