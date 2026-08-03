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
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final MongoTemplate mongoTemplate;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new AppException("BRAND_NAME_EXISTS", "Tên thương hiệu đã tồn tại: " + request.getName(), HttpStatus.BAD_REQUEST);
        }

        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : SlugUtils.toSlug(request.getName());
        if (brandRepository.existsBySlugAndDeletedFalse(slug)) {
            throw new AppException("BRAND_SLUG_EXISTS", "Slug thương hiệu đã tồn tại: " + slug, HttpStatus.BAD_REQUEST);
        }

        Brand brand = brandMapper.toEntity(request);
        brand.setSlug(slug);
        brand.setActive(request.getActive() != null ? request.getActive() : true);
        brand.setCreatedBy(SecurityUtils.getCurrentUsername());

        Brand savedBrand = brandRepository.save(brand);
        auditLogService.log("CREATE_BRAND", SecurityUtils.getCurrentUsername(), "Created brand: " + savedBrand.getName());

        return brandMapper.toResponse(savedBrand);
    }

    @Override
    public PageResponse<BrandResponse> getAllBrands(BrandFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, Sort.Order.desc("createdAt"), Sort.Order.asc("id"));
        Query query = new Query().with(finalPageable);

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

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Brand.class);
        List<Brand> brands = mongoTemplate.find(query, Brand.class);

        Page<Brand> brandPage = new PageImpl<>(brands, finalPageable, count);
        return brandMapper.toPageResponse(brandPage);
    }

    @Override
    public BrandResponse getBrandById(String id) {
        Brand brand = brandRepository.findById(id)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Brand Not Found", "BRAND_NOT_FOUND"));
        return brandMapper.toResponse(brand);
    }

    @Override
    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findByActiveTrueAndDeletedFalse()
                .stream()
                .map(brandMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(String id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Brand Not Found", "BRAND_NOT_FOUND"));

        if (StringUtils.hasText(request.getName()) && !request.getName().equals(brand.getName())) {
            if (brandRepository.existsByNameAndIdNotAndDeletedFalse(request.getName(), id)) {
                throw new AppException("BRAND_NAME_EXISTS", "Tên thương hiệu đã tồn tại: " + request.getName(), HttpStatus.BAD_REQUEST);
            }
        }

        if (StringUtils.hasText(request.getSlug()) && !request.getSlug().equals(brand.getSlug())) {
            if (brandRepository.existsBySlugAndIdNotAndDeletedFalse(request.getSlug(), id)) {
                throw new AppException("BRAND_SLUG_EXISTS", "Slug thương hiệu đã tồn tại: " + request.getSlug(), HttpStatus.BAD_REQUEST);
            }
        }

        String oldLogo = brand.getLogo();

        brandMapper.updateBrandFromRequest(request, brand);
        brand.setUpdatedBy(SecurityUtils.getCurrentUsername());

        String newLogo = brand.getLogo();
        if (StringUtils.hasText(oldLogo) && StringUtils.hasText(newLogo) && !oldLogo.equals(newLogo)) {
            cloudinaryService.deleteByUrl(oldLogo);
        }

        Brand updatedBrand = brandRepository.save(brand);
        auditLogService.log("UPDATE_BRAND", SecurityUtils.getCurrentUsername(), "Updated brand: " + updatedBrand.getName());

        return brandMapper.toResponse(updatedBrand);
    }

    @Override
    @Transactional
    public void deleteBrand(String id) {
        Brand brand = brandRepository.findById(id)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Brand Not Found", "BRAND_NOT_FOUND"));

        if (StringUtils.hasText(brand.getLogo())) {
            cloudinaryService.deleteByUrl(brand.getLogo());
        }

        brand.setDeleted(true);
        brand.setUpdatedBy(SecurityUtils.getCurrentUsername());
        brandRepository.save(brand);

        auditLogService.log("DELETE_BRAND", SecurityUtils.getCurrentUsername(), "Deleted brand: " + brand.getName());
    }
}
