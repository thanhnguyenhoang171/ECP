package com.example.ecp_api.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.example.ecp_api.dto.excel.CategoryExcelDto;
import com.example.ecp_api.dto.excel.CategoryTemplateDto;
import com.example.ecp_api.dto.request.CategoryFilterRequest;
import com.example.ecp_api.dto.request.CategoryRequest;
import com.example.ecp_api.dto.response.CategoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.CategoryMapper;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.service.CategoryService;
import com.example.ecp_api.service.helper.CategoryHelper;
import com.example.ecp_api.util.DateTimeUtils;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.OutputStream;
import java.util.ArrayList;
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

    // CREATE A NEW CATEGORY
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Auto generate Slug
        String slugGenerated = StringUtils.hasText(request.getSlug())
                ? request.getSlug()
                : SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlugAndDeletedFalse(slugGenerated)) {
            throw new AppException("Category with Slug already exists", HttpStatus.BAD_REQUEST);
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
        return categoryMapper.toResponse(savedCategory);
    }

    // GET LIST CATEGORIES WITH PAGINATION
    @Override
    public PageResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter, Pageable pageable) {
        Query query = new Query().with(pageable);

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
            throw new AppException("Category with Slug already exists", HttpStatus.BAD_REQUEST);
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
            throw new AppException("Cannot delete category that has sub-categories", HttpStatus.BAD_REQUEST);
        }

        category.setDeleted(true);
        categoryRepository.save(category);
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


//--------------------------------
//    TODO: Fix later
    @Override
    @Transactional(readOnly = true)
    public void exportAllToExcel(OutputStream outputStream) {
        try (Stream<Category> categoryStream = categoryRepository.findAllByDeletedFalse()) {
            AtomicInteger index = new AtomicInteger(1);
            List<CategoryExcelDto> excelDtos = categoryStream
                    .map(cat -> {
                        CategoryResponse res = categoryMapper.toResponse(cat);
                        return CategoryExcelDto.builder()
                                .index(index.getAndIncrement())
                                .id(res.getId())
                                .name(res.getName())
                                .slug(res.getSlug())
                                .level(res.getLevel())
                                .status(res.isActive() ? "Hoạt động" : "Ngừng hoạt động")
                                .createdAt(DateTimeUtils.format(res.getCreatedAt()))
                                .updatedAt(DateTimeUtils.format(res.getUpdatedAt()))
                                .build();
                    })
                    .toList();

            EasyExcel.write(outputStream, CategoryExcelDto.class)
                    .sheet("Danh sách loại hàng hoá")
                    .doWrite(excelDtos);
        }
    }

//    TODO: Fix later
    @Override
    public void exportCategoriesToExcel(OutputStream outputStream, List<CategoryResponse> categories) {
        AtomicInteger index = new AtomicInteger(1);
        List<CategoryExcelDto> excelDtos = categories.stream()
                .map(res -> CategoryExcelDto.builder()
                        .index(index.getAndIncrement())
                        .id(res.getId())
                        .name(res.getName())
                        .slug(res.getSlug())
                        .level(res.getLevel())
                        .status(res.isActive() ? "Hoạt động" : "Ngừng hoạt động")
                        .createdAt(DateTimeUtils.format(res.getCreatedAt()))
                        .updatedAt(DateTimeUtils.format(res.getUpdatedAt()))
                        .build())
                .toList();

        EasyExcel.write(outputStream, CategoryExcelDto.class)
                .sheet("Danh sách loại hàng hoá")
                .doWrite(excelDtos);
    }

    //    TODO: Fix later
    @Override
    public void downloadCategoryTemplate(OutputStream outputStream) {
        List<String> parentCategories = new ArrayList<>();
        try (Stream<Category> categoryStream = categoryRepository.findAllByDeletedFalse()) {
            categoryStream.forEach(cat -> parentCategories.add(cat.getName() + " | " + cat.getId()));
        } catch (Exception e) {
            // Log or handle the exception if needed, but since EasyExcel handles it, we can just let it be
        }

        CategoryTemplateDto sample = CategoryTemplateDto.builder()
                .index(1)
                .id("")
                .name("Snack mặn")
                .slug("snack-man")
                .parentNameWithId("")
                .description("Các loại đồ ăn vặt vị mặn")
                .status("Hoạt động")
                .build();

        EasyExcel.write(outputStream, CategoryTemplateDto.class)
                .registerWriteHandler(new SheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder, WriteSheetHolder writeSheetHolder) {
                        Sheet sheet = writeSheetHolder.getSheet();
                        DataValidationHelper helper = sheet.getDataValidationHelper();

                        // 1. Parent Categories Dropdown (Column E - Index 4)
                        if (!parentCategories.isEmpty()) {
                            Workbook workbook = writeWorkbookHolder.getWorkbook();
                            Sheet hiddenSheet = workbook.createSheet("CategoriesData");
                            workbook.setSheetHidden(workbook.getSheetIndex(hiddenSheet), true);

                            for (int i = 0; i < parentCategories.size(); i++) {
                                hiddenSheet.createRow(i).createCell(0).setCellValue(parentCategories.get(i));
                            }

                            Name namedRange = workbook.createName();
                            namedRange.setNameName("ParentList");
                            namedRange.setRefersToFormula("CategoriesData!$A$1:$A$" + parentCategories.size());

                            DataValidationConstraint constraint = helper.createFormulaListConstraint("ParentList");
                            CellRangeAddressList addressList = new CellRangeAddressList(1, 2000, 4, 4);
                            DataValidation validation = helper.createValidation(constraint, addressList);

                            validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
                            validation.createErrorBox("Dữ liệu không hợp lệ", "Vui lòng chọn danh mục từ danh sách thả xuống!");
                            validation.setShowErrorBox(true);

                            sheet.addValidationData(validation);
                        }

                        // 2. Status Dropdown (Column G - Index 6)
                        DataValidationConstraint statusConstraint = helper.createExplicitListConstraint(new String[]{"Hoạt động", "Ngừng hoạt động"});
                        CellRangeAddressList statusAddress = new CellRangeAddressList(1, 2000, 6, 6);
                        DataValidation statusValidation = helper.createValidation(statusConstraint, statusAddress);
                        sheet.addValidationData(statusValidation);
                    }
                })
                .sheet("Template Import Category")
                .doWrite(List.of(sample));
    }
}
