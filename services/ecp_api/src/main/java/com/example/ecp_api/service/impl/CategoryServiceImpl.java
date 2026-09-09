package com.example.ecp_api.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.exception.ExcelDataConvertException;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.example.ecp_api.dto.excel.CategoryExcelDto;
import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.CategoryMapper;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.CategoryService;
import com.example.ecp_api.service.helper.CategoryHelper;
import com.example.ecp_api.service.helper.CategoryExcelHelper;
import com.example.ecp_api.util.DateTimeUtils;
import com.example.ecp_api.util.ExcelImageExtractor;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

import com.example.ecp_api.service.CloudinaryService;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

import com.example.ecp_api.entity.mongodb.embedded.ProductImage;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {


    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final MongoTemplate mongoTemplate;
    private final CategoryHelper categoryHelper;
    private final CategoryExcelHelper categoryExcelHelper;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;

    // CREATE A NEW CATEGORY
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        return createCategory(request, null);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, MultipartFile imageFile) {
        com.example.ecp_api.dto.response.CloudinaryAsset uploadedAsset = cloudinaryService.uploadSafely(imageFile, "categories");
        try {
            if (uploadedAsset != null) {
                request.setImage(ProductImage.builder()
                        .url(uploadedAsset.url())
                        .publicId(uploadedAsset.publicId())
                        .build());
            }

            // Auto generate Slug,
            String slugGenerated = StringUtils.hasText(request.getSlug())
                    ? request.getSlug()
                    : SlugUtils.toSlug(request.getName());

            if (categoryRepository.existsBySlugAndDeletedFalse(slugGenerated)) {
                throw new AppException("CATEGORY_SLUG_EXISTS", "Category with Slug already exists", HttpStatus.BAD_REQUEST);
            }

            Category category = categoryMapper.toEntity(request);
            category.setSlug(slugGenerated);

            // Ensure we use the value from request if provided, otherwise default to true
            if (request.getActive() != null) {
                category.setActive(request.getActive());
            } else {
                category.setActive(true);
            }

            // Hierarchy validation and path/level setup
            if (StringUtils.hasText(request.getParentId())) {
                categoryHelper.validateHierarchy(null, request.getParentId());
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
                category.setLevel(parent.getLevel() + 1);
            } else {
                category.setParentId(null);
                category.setLevel(1);
            }

            Category savedCategory = categoryRepository.save(category);

            auditLogService.log("CATEGORY_CREATE", SecurityUtils.getCurrentUserEmail(),
                    "Created category: " + savedCategory.getName());

            return categoryMapper.toResponse(savedCategory);
        } catch (Exception e) {
            cloudinaryService.rollbackSafely(uploadedAsset);
            throw e;
        }
    }

    // GET LIST CATEGORIES WITH PAGINATION
    @Override
    public PageResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Query query = new Query().with(finalPageable);
        if (filter != null) {
            if (StringUtils.hasText(filter.getKeyword())) {
                String pattern = filter.getKeyword();
                query.addCriteria(new Criteria().orOperator(
                        Criteria.where("name").regex(pattern, "i"),
                        Criteria.where("slug").regex(pattern, "i")
                ));
            }
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
            if (filter.getIsFeatured() != null) {
                query.addCriteria(Criteria.where("is_featured").is(filter.getIsFeatured()));
            }
            if (StringUtils.hasText(filter.getParentId())) {
                query.addCriteria(Criteria.where("parent_id").is(filter.getParentId()));
            }
            if (filter.getLevel() != null) {
                query.addCriteria(Criteria.where("level").is(filter.getLevel()));
            }
        }
        query.addCriteria(Criteria.where("is_deleted").is(false));

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Category.class);
        List<Category> categories = mongoTemplate.find(query, Category.class);

        Page<Category> page = new PageImpl<>(categories, finalPageable, count);
        return categoryMapper.toPageResponse(page);
    }

    // UPDATE A CATEGORY
    @Override
    @Transactional
    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        return updateCategory(id, request, null);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(String id, CategoryRequest request, MultipartFile imageFile) {
        com.example.ecp_api.dto.response.CloudinaryAsset uploadedAsset = cloudinaryService.uploadSafely(imageFile, "categories");
        try {
            if (uploadedAsset != null) {
                request.setImage(ProductImage.builder()
                        .url(uploadedAsset.url())
                        .publicId(uploadedAsset.publicId())
                        .build());
            }

            Category category = categoryRepository.findById(id)
                    .filter(c -> !c.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

            String oldPublicId = (category.getImage() != null) ? category.getImage().getPublicId() : null;
            String oldParentId = category.getParentId();
            String oldName = category.getName();
            String oldSlug = category.getSlug();

            categoryMapper.updateCategoryFromRequest(request, category);

            // Delete old image from Cloudinary if replaced
            if (uploadedAsset != null && StringUtils.hasText(oldPublicId)) {
                cloudinaryService.rollbackSafely(oldPublicId);
            }

            // Handle Slug Update (if not provided, check if name changed to regenerate)
            if (!StringUtils.hasText(request.getSlug())) {
                if (!category.getName().equals(oldName)) {
                    category.setSlug(com.example.ecp_api.util.SlugUtils.toSlug(category.getName()));
                } else {
                    category.setSlug(oldSlug); // Restore old slug if name didn't change and slug was null in request
                }
            }

            // Check slug uniqueness if it's changed
            if (!category.getSlug().equals(oldSlug)
                    && categoryRepository.existsBySlugAndDeletedFalse(category.getSlug())) {
                throw new AppException("CATEGORY_SLUG_EXISTS", "Category with Slug already exists", HttpStatus.BAD_REQUEST);
            }

            if (request.getActive() != null) {
                category.setActive(request.getActive());
            }

            // Handle parent change & Hierarchy validation
            boolean parentChanged = false;
            if (StringUtils.hasText(request.getParentId())) {
                if (!request.getParentId().equals(oldParentId)) {
                    categoryHelper.validateHierarchy(id, request.getParentId());

                    Category parent = categoryRepository.findById(request.getParentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found with id: " + request.getParentId()));

                    category.setLevel(parent.getLevel() + 1);
                    parentChanged = true;
                }
            } else if (oldParentId != null) {
                category.setLevel(1);
                category.setParentId(null);
                parentChanged = true;
            }

            Category updatedCategory = categoryRepository.save(category);

            // Update descendants' paths and levels if parent changed
            if (parentChanged) {
                categoryHelper.updateDescendants(updatedCategory);
            }

            auditLogService.log("CATEGORY_UPDATE", SecurityUtils.getCurrentUserEmail(), "Updated category with ID: " + updatedCategory.getId());

            return categoryMapper.toResponse(updatedCategory);
        } catch (Exception e) {
            cloudinaryService.rollbackSafely(uploadedAsset);
            throw e;
        }
    }

    // DELETE A CATEGORY
    @Override
    @Transactional
    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check exist child categories
        if (categoryRepository.existsByParentIdAndDeletedFalse(id)) {
            throw new AppException("CATEGORY_HAS_CHILDREN", "Cannot delete category that has sub-categories", HttpStatus.BAD_REQUEST);
        }

        category.setDeleted(true);
        categoryRepository.save(category);

        auditLogService.log("CATEGORY_DELETE", SecurityUtils.getCurrentUserEmail(), "Soft deleted category with ID: " + category.getId());
    }

    // GET CATEGORY DETAIL
    @Override
    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or deleted with id: " + id));
        return categoryMapper.toResponse(category);
    }

    // GET CATEGORY PARENTS
    @Override
    public List<CategoryResponse> getParentCategories() {
        Sort sort = Sort.by(Sort.Order.asc("order"), Sort.Order.desc("createdAt"));
        return categoryRepository.findByParentIdIsNullAndActiveTrueAndDeletedFalse(sort).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    // EXPORT ALL CATEGORIES TO EXCEL
    @Override
    @Transactional(readOnly = true)
    public void exportAllCategoriesToExcel(OutputStream outputStream) {
        try (Stream<Category> categoryStream = categoryRepository.findAllByDeletedFalse()) {
            List<Category> allCategories = categoryStream.toList();
            
            // Build a map for quick parent slug lookup to avoid N+1 queries
            java.util.Map<String, String> idToSlugMap = allCategories.stream()
                    .collect(java.util.stream.Collectors.toMap(Category::getId, Category::getSlug));

            AtomicInteger index = new AtomicInteger(1);
            List<com.example.ecp_api.dto.excel.CategoryExportExcelDto> excelDtos = allCategories.stream()
                    .map(cat -> {
                        String parentSlug = "";
                        if (StringUtils.hasText(cat.getParentId())) {
                            parentSlug = idToSlugMap.getOrDefault(cat.getParentId(), "");
                        }
                        java.net.URL parsedImageUrl = null;
                        try {
                            if (cat.getImage() != null && StringUtils.hasText(cat.getImage().getUrl())) {
                                parsedImageUrl = new URL(cat.getImage().getUrl());
                            }
                        } catch (Exception ignored) {
                        }

                        return com.example.ecp_api.dto.excel.CategoryExportExcelDto.builder()
                                .index(index.getAndIncrement())
                                .id(cat.getId())
                                .name(cat.getName())
                                .description(cat.getDescription())
                                .imageUrl(parsedImageUrl)
                                .slug(cat.getSlug())
                                .parentSlug(parentSlug)
                                .level(cat.getLevel())
                                .order(cat.getOrder())
                                .status(cat.isActive() ? "Active" : "InActive")
                                .createdAt(DateTimeUtils.format(cat.getCreatedAt()))
                                .updatedAt(DateTimeUtils.format(cat.getUpdatedAt()))
                                .build();
                    })
                    .toList();

            EasyExcel.write(outputStream, com.example.ecp_api.dto.excel.CategoryExportExcelDto.class)
                    .sheet("Categories")
                    .doWrite(excelDtos);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void downloadCategoryTemplate(OutputStream outputStream) {
        // Create specific sample data
        List<CategoryExcelDto> samples = List.of(
                CategoryExcelDto.builder()
                        .index(1)
                        .id("") // Leave empty to create new
                        .name("Đồ ăn vặt Thái Lan")
                        .description("Tổng hợp các món ăn vặt, snack đường phố và đặc sản đóng gói Thái Lan")
                        .slug("thai-snacks")
                        .parentCategory("")
                        .level(1)
                        .order(1)
                        .imageUrl("")
                        .build(),
                CategoryExcelDto.builder()
                        .index(2)
                        .id("") // Leave empty to create new
                        .name("Rong biển sấy & nướng giòn")
                        .description("Rong biển cuộn, rong biển nướng vị truyền thống và vị cay nồng")
                        .slug("seaweed-snacks")
                        .parentCategory("Đồ ăn vặt Thái Lan")
                        .level(2)
                        .order(2)
                        .imageUrl("")
                        .build(),
                CategoryExcelDto.builder()
                        .index(3)
                        .id("") // Leave empty to create new
                        .name("Mực & Hải sản cay tẩm vị")
                        .description("Mực khô tẩm gia vị, snack hải sản cay cay ngọt ngọt đặc trưng")
                        .slug("spicy-squid-snacks")
                        .parentCategory("Đồ ăn vặt Thái Lan")
                        .level(2)
                        .order(3)
                        .imageUrl("")
                        .build(),
                CategoryExcelDto.builder()
                        .index(4)
                        .id("") // Leave empty to create new
                        .name("Snack khoai tây & Bánh que")
                        .description("Snack khoai tây vị lẩu Thái, súp tôm Tom Yum và bánh que giòn cay")
                        .slug("chips-and-biscuits")
                        .parentCategory("Đồ ăn vặt Thái Lan")
                        .level(2)
                        .order(4)
                        .imageUrl("")
                        .build(),
                CategoryExcelDto.builder()
                        .index(5)
                        .id("") // Leave empty to create new
                        .name("Trái cây sấy & Kẹo dẻo Thái")
                        .description("Xoài sấy dẻo, kẹo dẻo trái cây và sầu riêng sấy thăng hoa Thái Lan")
                        .slug("dried-fruits-and-candies")
                        .parentCategory("Đồ ăn vặt Thái Lan")
                        .level(2)
                        .order(5)
                        .imageUrl("")
                        .build()
        );

        EasyExcel.write(outputStream, CategoryExcelDto.class)
                .registerWriteHandler(new SheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder, WriteSheetHolder writeSheetHolder) {
                        Sheet sheet = writeSheetHolder.getSheet();
                        // Freeze the first row (Header)
                        sheet.createFreezePane(0, 1);
                    }
                })
                .sheet("categories")
                .doWrite(samples);
    }

    @Override
    @Transactional
    public void importCategoriesFromExcel(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            Map<Integer, byte[]> rowImages = ExcelImageExtractor.extractImagesByRow(fileBytes);

            List<CategoryExcelDto> dataList = new java.util.ArrayList<>();
            List<String> errorMessages = new java.util.ArrayList<>();

            EasyExcel.read(new ByteArrayInputStream(fileBytes), CategoryExcelDto.class, new ReadListener<CategoryExcelDto>() {
                @Override
                public void invoke(CategoryExcelDto data, AnalysisContext context) {
                    int rowNum = context.readRowHolder().getRowIndex() + 1;
                    data.setRowNumber(rowNum);
                    if (rowImages.containsKey(rowNum)) {
                        data.setEmbeddedImageBytes(rowImages.get(rowNum));
                    }
                    dataList.add(data);
                }

                @Override
                public void onException(Exception exception, AnalysisContext context) {
                    if (exception instanceof ExcelDataConvertException convertException) {
                        int row = convertException.getRowIndex() + 1;
                        int col = convertException.getColumnIndex() + 1;
                        errorMessages.add("Row " + row + ", Column " + col + ": Invalid data format");
                    } else {
                        errorMessages.add("Error reading file at row " + (context.readRowHolder().getRowIndex() + 1) + ": " + exception.getMessage());
                    }
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {}
            }).sheet().doRead();

            // Sort data to process parents before children
            dataList.sort((d1, d2) -> {
                Integer l1 = d1.getLevel() != null ? d1.getLevel() : (StringUtils.hasText(d1.getParentSlug()) ? 2 : 1);
                Integer l2 = d2.getLevel() != null ? d2.getLevel() : (StringUtils.hasText(d2.getParentSlug()) ? 2 : 1);
                return l1.compareTo(l2);
            });

            int successCount = 0;

            for (CategoryExcelDto dto : dataList) {
                try {
                    categoryExcelHelper.upsertCategoryForImport(dto);
                    successCount++;
                } catch (Exception e) {
                    errorMessages.add("Row " + dto.getRowNumber() + ": " + e.getMessage());
                }
            }
            
            // If errors occurred
            if (!errorMessages.isEmpty()) {
                String detailError = String.join("\n- ", errorMessages);
                throw new AppException("IMPORT_PARTIAL_ERROR", 
                    "Import completed with " + successCount + " success(es) and " + errorMessages.size() + " failure(s).\nDetails:\n- " + detailError + "\n", 
                    HttpStatus.BAD_REQUEST);
            }

            auditLogService.log("CATEGORY_IMPORT", SecurityUtils.getCurrentUserEmail(), "Imported " + successCount + " categories from Excel");
        } catch (AppException e) {
            throw e; 
        } catch (Exception e) {
            throw new AppException("CATEGORY_IMPORT_FAILED", "Failed to process file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
