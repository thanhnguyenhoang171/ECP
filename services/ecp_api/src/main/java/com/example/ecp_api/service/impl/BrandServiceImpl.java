package com.example.ecp_api.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.example.ecp_api.dto.excel.BrandExcelDto;
import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.CloudinaryAsset;
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
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.ecp_api.dto.excel.BrandExportExcelDto;
import com.example.ecp_api.service.helper.BrandExcelHelper;
import com.example.ecp_api.util.DateTimeUtils;
import com.example.ecp_api.util.ExcelImageExtractor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final MongoTemplate mongoTemplate;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;
    private final BrandExcelHelper brandExcelHelper;

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request, MultipartFile logoFile) {
        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : SlugUtils.toSlug(request.getName());
        validateNameUniqueness(null, request.getName());
        validateSlugUniqueness(null, slug);

        CloudinaryAsset uploadedLogo = cloudinaryService.uploadSafely(logoFile, "brands");
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
            cloudinaryService.rollbackSafely(uploadedLogo);
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

        CloudinaryAsset uploadedLogo = cloudinaryService.uploadSafely(logoFile, "brands");
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
            cloudinaryService.rollbackSafely(uploadedLogo);
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

    @Override
    @Transactional(readOnly = true)
    public void downloadBrandTemplate(OutputStream outputStream) {
        List<BrandExcelDto> samples = List.of(
                BrandExcelDto.builder()
                        .index(1)
                        .id("") // Leave empty to create new
                        .name("Apple")
                        .description("Multinational technology company headquartered in Cupertino, California")
                        .website("https://www.apple.com")
                        .slug("apple")
                        .active(true)
                        .logo("")
                        .build(),
                BrandExcelDto.builder()
                        .index(2)
                        .id("") // Leave empty to create new
                        .name("Samsung")
                        .description("South Korean multinational manufacturing conglomerate")
                        .website("https://www.samsung.com")
                        .slug("samsung")
                        .active(true)
                        .logo("")
                        .build(),
                BrandExcelDto.builder()
                        .index(3)
                        .id("") // Leave empty to create new
                        .name("Sony")
                        .description("Japanese multinational conglomerate corporation")
                        .website("https://www.sony.com")
                        .slug("sony")
                        .active(true)
                        .logo("")
                        .build()
        );

        EasyExcel.write(outputStream, BrandExcelDto.class)
                .registerWriteHandler(new SheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder, WriteSheetHolder writeSheetHolder) {
                        Sheet sheet = writeSheetHolder.getSheet();
                        sheet.createFreezePane(0, 1);
                    }
                })
                .sheet("brands")
                .doWrite(samples);
    }

    @Override
    @Transactional
    public void importBrandsFromExcel(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            Map<Integer, byte[]> rowImages = ExcelImageExtractor.extractImagesByRow(fileBytes);

            List<BrandExcelDto> dataList = new ArrayList<>();
            List<String> errorMessages = new ArrayList<>();

            EasyExcel.read(new ByteArrayInputStream(fileBytes), BrandExcelDto.class, new com.alibaba.excel.read.listener.ReadListener<BrandExcelDto>() {
                @Override
                public void invoke(BrandExcelDto data, com.alibaba.excel.context.AnalysisContext context) {
                    int rowNum = context.readRowHolder().getRowIndex() + 1;
                    data.setRowNumber(rowNum);
                    if (rowImages.containsKey(rowNum)) {
                        data.setEmbeddedImageBytes(rowImages.get(rowNum));
                    }
                    dataList.add(data);
                }

                @Override
                public void onException(Exception exception, com.alibaba.excel.context.AnalysisContext context) {
                    if (exception instanceof com.alibaba.excel.exception.ExcelDataConvertException convertException) {
                        int row = convertException.getRowIndex() + 1;
                        int col = convertException.getColumnIndex() + 1;
                        errorMessages.add("Row " + row + ", Column " + col + ": Invalid data format");
                    } else {
                        errorMessages.add("Error reading file at row " + (context.readRowHolder().getRowIndex() + 1) + ": " + exception.getMessage());
                    }
                }

                @Override
                public void doAfterAllAnalysed(com.alibaba.excel.context.AnalysisContext context) {}
            }).sheet().doRead();

            int successCount = 0;
            for (BrandExcelDto dto : dataList) {
                try {
                    brandExcelHelper.upsertBrandForImport(dto);
                    successCount++;
                } catch (Exception e) {
                    errorMessages.add("Row " + dto.getRowNumber() + ": " + e.getMessage());
                }
            }

            if (!errorMessages.isEmpty()) {
                String detailError = String.join("\n- ", errorMessages);
                throw new AppException("IMPORT_PARTIAL_ERROR",
                        "Import completed with " + successCount + " success(es) and " + errorMessages.size() + " failure(s).\nDetails:\n- " + detailError + "\n",
                        HttpStatus.BAD_REQUEST);
            }

            auditLogService.log("BRAND_IMPORT", SecurityUtils.getCurrentUserEmail(), "Imported " + successCount + " brands from Excel");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("BRAND_IMPORT_FAILED", "Failed to process file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void exportAllBrandsToExcel(OutputStream outputStream) {
        try (Stream<Brand> brandStream = brandRepository.findAllByDeletedFalse()) {
            List<Brand> allBrands = brandStream.toList();
            AtomicInteger index = new AtomicInteger(1);

            List<BrandExportExcelDto> excelDtos = allBrands.stream()
                    .map(brand -> {
                        URL parsedLogoUrl = null;
                        try {
                            if (StringUtils.hasText(brand.getLogo())) {
                                parsedLogoUrl = new URL(brand.getLogo());
                            }
                        } catch (Exception ignored) {
                        }

                        return BrandExportExcelDto.builder()
                                .index(index.getAndIncrement())
                                .id(brand.getId())
                                .name(brand.getName())
                                .description(brand.getDescription())
                                .website(brand.getWebsite())
                                .slug(brand.getSlug())
                                .logo(parsedLogoUrl)
                                .status(brand.isActive() ? "Active" : "InActive")
                                .createdAt(DateTimeUtils.format(brand.getCreatedAt()))
                                .updatedAt(DateTimeUtils.format(brand.getUpdatedAt()))
                                .build();
                    })
                    .toList();

            EasyExcel.write(outputStream, BrandExportExcelDto.class)
                    .sheet("Brands")
                    .doWrite(excelDtos);
        }
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
}
