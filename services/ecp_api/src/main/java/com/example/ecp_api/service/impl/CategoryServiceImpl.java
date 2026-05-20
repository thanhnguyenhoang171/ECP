package com.example.ecp_api.service.impl;

import com.alibaba.excel.EasyExcel;
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
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {


    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final MongoTemplate mongoTemplate;
    private final CategoryHelper categoryHelper;
    private final CategoryExcelHelper categoryExcelHelper;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "SYSTEM";
    }

    // CREATE A NEW CATEGORY
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Auto generate Slug
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
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found with id: " + request.getParentId()));

            category.setLevel(parent.getLevel() + 1);
            category.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
        } else {
            category.setLevel(1);
            category.setPath(null);
        }

        Category savedCategory = categoryRepository.save(category);
        
        // Update path now that we have an ID
        if (!StringUtils.hasText(request.getParentId())) {
            savedCategory.setPath(savedCategory.getId());
            categoryRepository.save(savedCategory);
        }
        
        auditLogService.log("CREATE_CATEGORY", getCurrentUsername(), "Created category: " + savedCategory.getName());
        
        return categoryMapper.toResponse(savedCategory);
    }

    // GET LIST CATEGORIES WITH PAGINATION
    @Override
    public PageResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter, Pageable pageable) {
        // Đảm bảo luôn có sort ổn định để tránh trùng lặp dữ liệu giữa các trang (Stable Sorting)
        Sort sort = pageable.getSort();
        if (sort.isUnsorted()) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        // Thêm tie-breaker bằng id
        sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));

        Query query = new Query().with(pageable).with(sort);

        if (StringUtils.hasText(filter.getId())) {
            query.addCriteria(Criteria.where("id").is(filter.getId()));
        }

        if (StringUtils.hasText(filter.getName())) {
            query.addCriteria(Criteria.where("name").regex(filter.getName(), "i"));
        }
        if (StringUtils.hasText(filter.getParentId())) {
            query.addCriteria(Criteria.where("parent_id").is(filter.getParentId()));
        }
        if (filter.getLevel() != null) {
            query.addCriteria(Criteria.where("level").is(filter.getLevel()));
        }
        if (filter.getActive() != null) {
            query.addCriteria(Criteria.where("is_active").is(filter.getActive()));
        }

        // Exclude deleted items
        query.addCriteria(Criteria.where("is_deleted").is(false));

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Category.class);
        List<Category> categories = mongoTemplate.find(query, Category.class);

        Page<Category> categoryPage = new PageImpl<>(categories, pageable, count);
        return categoryMapper.toPageResponse(categoryPage);
    }

    // UPDATE A CATEGORY
    @Override
    @Transactional
    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String oldParentId = category.getParentId();
        String oldName = category.getName();
        String oldSlug = category.getSlug();

        categoryMapper.updateCategoryFromRequest(request, category);

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
                category.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
                parentChanged = true;
            }
        } else if (oldParentId != null) {
            category.setLevel(1);
            category.setPath(null);
            category.setParentId(null);
            parentChanged = true;
        }

        Category updatedCategory = categoryRepository.save(category);

        // Update descendants' paths and levels if parent changed
        if (parentChanged) {
            categoryHelper.updateDescendants(updatedCategory);
        }

        auditLogService.log("UPDATE_CATEGORY", getCurrentUsername(), "Updated category with ID: " + updatedCategory.getId());

        return categoryMapper.toResponse(updatedCategory);
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

        auditLogService.log("DELETE_CATEGORY", getCurrentUsername(), "Soft deleted category with ID: " + category.getId());
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
        return categoryRepository.findByParentIdIsNullAndDeletedFalse().stream()
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
            List<CategoryExcelDto> excelDtos = allCategories.stream()
                    .map(cat -> {
                        String parentSlug = "";
                        if (StringUtils.hasText(cat.getParentId())) {
                            parentSlug = idToSlugMap.getOrDefault(cat.getParentId(), "");
                        }
                        return CategoryExcelDto.builder()
                                .index(index.getAndIncrement())
                                .id(cat.getId())
                                .name(cat.getName())
                                .slug(cat.getSlug())
                                .parentSlug(parentSlug)
                                .level(cat.getLevel())
                                .status(cat.isActive())
                                .createdAt(DateTimeUtils.format(cat.getCreatedAt()))
                                .updatedAt(DateTimeUtils.format(cat.getUpdatedAt()))
                                .build();
                    })
                    .toList();

            EasyExcel.write(outputStream, CategoryExcelDto.class)
                    .sheet("Danh sách loại hàng hoá")
                    .doWrite(excelDtos);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void downloadCategoryTemplate(OutputStream outputStream) {
        // Create specific sample data as requested
        List<CategoryExcelDto> samples = List.of(
                CategoryExcelDto.builder()
                        .index(1)
                        .id("") // Để trống để tạo mới
                        .name("Áo thun nam")
                        .slug("ao-thun-nam")
                        .parentSlug("")
                        .level(1)
                        .status(true)
                        .createdAt("03/05/2026 19:15:01")
                        .updatedAt("03/05/2026 19:15:01")
                        .build(),
                CategoryExcelDto.builder()
                        .index(2)
                        .id("") // Để trống để tạo mới
                        .name("Áo thun polo")
                        .slug("ao-thun-polo")
                        .parentSlug("ao-thun-nam") // Dùng Slug của danh mục cha
                        .level(2)
                        .status(true)
                        .createdAt("03/05/2026 19:15:01")
                        .updatedAt("03/05/2026 19:15:01")
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
                .sheet("Template Import Category")
                .doWrite(samples);
    }

    @Override
    @Transactional
    public void importCategoriesFromExcel(MultipartFile file) {
        try {
            List<CategoryExcelDto> dataList = new java.util.ArrayList<>();
            List<String> errorMessages = new java.util.ArrayList<>();

            EasyExcel.read(file.getInputStream(), CategoryExcelDto.class, new com.alibaba.excel.read.listener.ReadListener<CategoryExcelDto>() {
                @Override
                public void invoke(CategoryExcelDto data, com.alibaba.excel.context.AnalysisContext context) {
                    data.setRowNumber(context.readRowHolder().getRowIndex() + 1);
                    dataList.add(data);
                }

                @Override
                public void onException(Exception exception, com.alibaba.excel.context.AnalysisContext context) {
                    if (exception instanceof com.alibaba.excel.exception.ExcelDataConvertException) {
                        com.alibaba.excel.exception.ExcelDataConvertException convertException = (com.alibaba.excel.exception.ExcelDataConvertException) exception;
                        int row = convertException.getRowIndex() + 1;
                        int col = convertException.getColumnIndex() + 1;
                        // Thử lấy tên cột nếu có thể, không thì dùng số thứ tự cột
                        errorMessages.add("Hàng " + row + ", Cột " + col + ": Dữ liệu không hợp lệ (Sai định dạng)");
                    } else {
                        errorMessages.add("Lỗi đọc file tại dòng " + (context.readRowHolder().getRowIndex() + 1) + ": " + exception.getMessage());
                    }
                }

                @Override
                public void doAfterAllAnalysed(com.alibaba.excel.context.AnalysisContext context) {}
            }).sheet().doRead();

            // Sắp xếp dữ liệu để xử lý cha trước con
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
                    errorMessages.add("Hàng " + dto.getRowNumber() + ": " + e.getMessage());
                }
            }
            
            // Nếu có lỗi (bao gồm lỗi định dạng và lỗi nghiệp vụ)
            if (!errorMessages.isEmpty()) {
                String detailError = String.join("\n", errorMessages);
                throw new AppException("IMPORT_PARTIAL_ERROR", 
                    "Import hoàn tất với " + successCount + " thành công và " + errorMessages.size() + " thất bại. \n * Chi tiết: \n" + '-' + detailError + "\n", 
                    HttpStatus.BAD_REQUEST);
            }

            auditLogService.log("IMPORT_CATEGORIES", getCurrentUsername(), "Imported " + successCount + " categories from Excel");
        } catch (AppException e) {
            throw e; 
        } catch (Exception e) {
            throw new AppException("CATEGORY_IMPORT_FAILED", "Lỗi xử lý file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
