package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.Brand;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.BrandMapper;
import com.example.ecp_api.repository.mongodb.BrandRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.BrandService;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final MongoTemplate mongoTemplate;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request, MultipartFile logoFile) {
        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : SlugUtils.toSlug(request.getName());
        validateNameUniqueness(null, request.getName());
        validateSlugUniqueness(null, slug);

        UploadedAsset uploadedLogo = uploadLogoSafely(logoFile);
        try {
            if (uploadedLogo != null) {
                request.setLogo(uploadedLogo.url());
            }

            Brand brand = brandMapper.toEntity(request);
            brand.setSlug(slug);
            brand.setActive(request.getActive() != null ? request.getActive() : true);
            brand.setCreatedBy(SecurityUtils.getCurrentUserEmail());

            Brand saved = brandRepository.save(brand);
            auditLogService.log("BRAND_CREATE", SecurityUtils.getCurrentUserEmail(), "Created brand: " + saved.getName());
            return brandMapper.toResponse(saved);
        } catch (Exception ex) {
            rollbackUploadedAsset(uploadedLogo);
            throw ex;
        }
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(String id, BrandRequest request, MultipartFile logoFile) {
        Brand brand = findActiveBrand(id);

        if (StringUtils.hasText(request.getName()) && !request.getName().equals(brand.getName())) {
            validateNameUniqueness(id, request.getName());
        }

        if (StringUtils.hasText(request.getSlug()) && !request.getSlug().equals(brand.getSlug())) {
            validateSlugUniqueness(id, request.getSlug());
        }

        UploadedAsset uploadedLogo = uploadLogoSafely(logoFile);
        try {
            String oldLogo = brand.getLogo();
            if (uploadedLogo != null) {
                request.setLogo(uploadedLogo.url());
            }

            brandMapper.updateBrandFromRequest(request, brand);
            brand.setUpdatedBy(SecurityUtils.getCurrentUserEmail());

            String newLogo = brand.getLogo();
            if (StringUtils.hasText(oldLogo) && StringUtils.hasText(newLogo) && !oldLogo.equals(newLogo)) {
                cloudinaryService.deleteByUrl(oldLogo);
            }

            Brand updated = brandRepository.save(brand);
            auditLogService.log("BRAND_UPDATE", SecurityUtils.getCurrentUserEmail(), "Updated brand: " + updated.getName());
            return brandMapper.toResponse(updated);
        } catch (Exception ex) {
            rollbackUploadedAsset(uploadedLogo);
            throw ex;
        }
    }

    @Override
    public PageResponse<BrandResponse> getAllBrands(BrandFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, Sort.Order.desc("createdAt"), Sort.Order.asc("id"));
        Query query = buildFilterQuery(filter, finalPageable);
        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Brand.class);
        List<Brand> brands = mongoTemplate.find(query, Brand.class);
        return brandMapper.toPageResponse(new PageImpl<>(brands, finalPageable, count));
    }

    @Override
    public BrandResponse getBrandById(String id) {
        return brandMapper.toResponse(findActiveBrand(id));
    }

    @Override
    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findByActiveTrueAndDeletedFalse()
                .stream().map(brandMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBrand(String id) {
        Brand brand = findActiveBrand(id);
        if (StringUtils.hasText(brand.getLogo())) {
            cloudinaryService.deleteByUrl(brand.getLogo());
        }
        brand.setDeleted(true);
        brand.setUpdatedBy(SecurityUtils.getCurrentUserEmail());
        brandRepository.save(brand);
        auditLogService.log("BRAND_DELETE", SecurityUtils.getCurrentUserEmail(), "Deleted brand: " + brand.getName());
    }

    // ─────────────────────────── PRIVATE HELPERS ───────────────────────────

    private Brand findActiveBrand(String id) {
        return brandRepository.findById(id)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Brand Not Found", "BRAND_NOT_FOUND"));
    }

    private void validateNameUniqueness(String currentId, String name) {
        boolean exists = (currentId == null)
                ? brandRepository.existsByNameAndDeletedFalse(name)
                : brandRepository.existsByNameAndIdNotAndDeletedFalse(name, currentId);
        if (exists) {
            throw new AppException("BRAND_NAME_EXISTS", "Tên thương hiệu đã tồn tại: " + name, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSlugUniqueness(String currentId, String slug) {
        boolean exists = (currentId == null)
                ? brandRepository.existsBySlugAndDeletedFalse(slug)
                : brandRepository.existsBySlugAndIdNotAndDeletedFalse(slug, currentId);
        if (exists) {
            throw new AppException("BRAND_SLUG_EXISTS", "Slug thương hiệu đã tồn tại: " + slug, HttpStatus.BAD_REQUEST);
        }
    }

    private Query buildFilterQuery(BrandFilterRequest filter, Pageable pageable) {
        Query query = new Query().with(pageable);
        if (filter != null) {
            if (StringUtils.hasText(filter.getId())) {
                query.addCriteria(Criteria.where("_id").is(filter.getId()));
            }
            if (StringUtils.hasText(filter.getName())) {
                query.addCriteria(Criteria.where("name").regex(filter.getName(), "i"));
            }
            if (StringUtils.hasText(filter.getSlug())) {
                query.addCriteria(Criteria.where("slug").regex(filter.getSlug(), "i"));
            }
            if (filter.getActive() != null) {
                query.addCriteria(Criteria.where("is_active").is(filter.getActive()));
            }
        }
        query.addCriteria(Criteria.where("is_deleted").is(false));
        return query;
    }

    private record UploadedAsset(String url, String publicId) {}

    private UploadedAsset uploadLogoSafely(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        Map<?, ?> result = cloudinaryService.upload(file, "brands");
        if (result != null && result.containsKey("secure_url")) {
            return new UploadedAsset((String) result.get("secure_url"), (String) result.get("public_id"));
        }
        return null;
    }

    private void rollbackUploadedAsset(UploadedAsset asset) {
        if (asset != null && StringUtils.hasText(asset.publicId())) {
            try {
                cloudinaryService.delete(asset.publicId());
            } catch (Exception ex) {
                log.error("Failed to rollback Cloudinary asset {}: {}", asset.publicId(), ex.getMessage());
            }
        }
    }
}
