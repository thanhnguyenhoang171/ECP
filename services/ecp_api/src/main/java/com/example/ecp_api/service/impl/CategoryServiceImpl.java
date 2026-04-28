package com.example.ecp_api.service.impl;

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
import com.example.ecp_api.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {


    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final MongoTemplate mongoTemplate;
    private final com.example.ecp_api.service.helper.CategoryHelper categoryHelper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // 1. Auto generate Slug
        String slug = StringUtils.hasText(request.getSlug()) 
                ? request.getSlug() 
                : com.example.ecp_api.util.SlugUtils.toSlug(request.getName());
        
        if (categoryRepository.existsBySlugAndDeletedFalse(slug)) {
            throw new AppException("Category with Slug already exists", HttpStatus.BAD_REQUEST);
        }

        Category category = categoryMapper.toEntity(request);
        category.setSlug(slug);
        
        // MapStruct might set false if request.isActive is null, so we override it
        if (request.getIsActive() == null) {
            category.setActive(true);
        }

        // 2. Hierarchy validation and path/level setup
        if (StringUtils.hasText(request.getParentId())) {
            categoryHelper.validateHierarchy(null, request.getParentId());
            
            Category parent = categoryRepository.findById(request.getParentId()).get();
            
            category.setLevel(parent.getLevel() + 1);
            category.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
        } else {
            category.setLevel(1);
            category.setPath(null); 
        }

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

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

        // 1. Handle Slug Update (if not provided, check if name changed to regenerate)
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

        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        // 2. Handle parent change & Hierarchy validation
        boolean parentChanged = false;
        if (StringUtils.hasText(request.getParentId())) {
            if (!request.getParentId().equals(oldParentId)) {
                categoryHelper.validateHierarchy(id, request.getParentId());

                Category parent = categoryRepository.findById(request.getParentId()).get();

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
            updateDescendants(updatedCategory);
        }

        return categoryMapper.toResponse(updatedCategory);
    }

    private void updateDescendants(Category parent) {
        List<Category> children = categoryRepository.findAll().stream()
                .filter(c -> parent.getId().equals(c.getParentId()) && !c.isDeleted())
                .toList();

        for (Category child : children) {
            child.setLevel(parent.getLevel() + 1);
            child.setPath(parent.getPath() == null ? parent.getId() : parent.getPath() + "/" + parent.getId());
            categoryRepository.save(child);
        }
    }

    @Override
    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or deleted with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    public PageResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter, Pageable pageable) {
        Query query = new Query().with(pageable);

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

    @Override
    public List<CategoryResponse> getParentCategories() {
        return categoryRepository.findByParentIdIsNullAndDeletedFalse().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Kiểm tra xem có danh mục con không
        if (categoryRepository.existsByParentIdAndDeletedFalse(id)) {
            throw new AppException("Cannot delete category that has sub-categories", HttpStatus.BAD_REQUEST);
        }

        category.setDeleted(true);
        categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportAllToExcel(OutputStream outputStream) throws IOException {
        try (Stream<Category> categoryStream = categoryRepository.findAllByDeletedFalse()) {
            List<CategoryResponse> categories = categoryStream
                    .map(categoryMapper::toResponse)
                    .toList();
            exportCategoriesToExcel(outputStream, categories);
        }
    }

    @Override
    public void exportCategoriesToExcel(OutputStream outputStream, List<CategoryResponse> categories) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            Sheet sheet = workbook.createSheet("Danh sách loại hàng hoá");
            
            // Bật tính năng theo dõi độ rộng cột để auto-size (dành riêng cho SXSSF)
            if (sheet instanceof SXSSFSheet) {
                ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
            }

            // Create Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create Header Row
            String[] headers = {"STT", "_id", "Tên loại sản phẩm", "Slug", "Cấp độ", "Mô tả", "Trạng thái HĐ", "Ngày tạo", "Ngày sửa"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill data into rows
            int rowIdx = 1;
            for (CategoryResponse category : categories) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(category.getId() != null ? category.getId() : "");
                row.createCell(2).setCellValue(category.getName() != null ? category.getName() : "");
                row.createCell(3).setCellValue(category.getSlug() != null ? category.getSlug() : "");
                row.createCell(4).setCellValue(category.getLevel());
                row.createCell(5).setCellValue(category.getDescription() != null ? category.getDescription() : "");
                row.createCell(6).setCellValue(category.isActive() ? "Hoạt động" : "Ngừng hoạt động");
                row.createCell(7).setCellValue(DateTimeUtils.format(category.getCreatedAt()));
                row.createCell(8).setCellValue(DateTimeUtils.format(category.getUpdatedAt()));
            }

            // Tự động căn chỉnh độ rộng cho tất cả các cột
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            outputStream.flush();
            workbook.dispose();
        }
    }

//    TODO: Update later
    @Override
    public void downloadCategoryTemplate(OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Template Import Category");

            String[] headers = {"STT (*)", "ID (Để trống nếu tạo mới)", "Tên loại sản phẩm (*)", "Slug (Tự động nếu trống)", "Danh mục cha (Chọn list)", "Mô tả", "Trạng thái"};

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Tạo Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Tạo Hidden Sheet chứa dữ liệu Category Cha
            Sheet hiddenSheet = workbook.createSheet("CategoriesData");
            workbook.setSheetHidden(workbook.getSheetIndex(hiddenSheet), true);

            List<Category> existingCategories;
            try (Stream<Category> categoryStream = categoryRepository.findAllByDeletedFalse()) {
                existingCategories = categoryStream.toList();
            }

            for (int i = 0; i < existingCategories.size(); i++) {
                Category cat = existingCategories.get(i);
                Row row = hiddenSheet.createRow(i);
                // Format: "Ten Danh Muc | ID" để người dùng dễ nhận biết nhưng vẫn lấy được ID
                row.createCell(0).setCellValue(cat.getName() + " | " + cat.getId());
            }

            // Thêm Validation Dropdown cho cột "Danh mục cha" (Cột E - Index 4)
            DataValidationHelper validationHelper = sheet.getDataValidationHelper();
            if (!existingCategories.isEmpty()) {
                // Tạo Name Range cho danh sách (Cách này ổn định hơn công thức trực tiếp)
                Name namedRange = workbook.createName();
                namedRange.setNameName("ParentList");
                namedRange.setRefersToFormula("CategoriesData!$A$1:$A$" + existingCategories.size());

                DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("ParentList");
                // Áp dụng từ dòng 2 đến 2000, cột E (index 4)
                CellRangeAddressList addressList = new CellRangeAddressList(1, 2000, 4, 4);
                DataValidation validation = validationHelper.createValidation(constraint, addressList);

                validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
                validation.createErrorBox("Dữ liệu không hợp lệ", "Vui lòng chọn danh mục từ danh sách thả xuống!");
                validation.setShowErrorBox(true);
                validation.setSuppressDropDownArrow(true); // Quan trọng: Hiển thị mũi tên dropdown

                sheet.addValidationData(validation);
            }

            // Thêm Dropdown cố định cho cột "Trạng thái" (Cột G - Index 6)
            DataValidationConstraint statusConstraint = validationHelper.createExplicitListConstraint(new String[]{"Hoạt động", "Ngừng hoạt động"});
            CellRangeAddressList statusAddress = new CellRangeAddressList(1, 2000, 6, 6);
            DataValidation statusValidation = validationHelper.createValidation(statusConstraint, statusAddress);
            sheet.addValidationData(statusValidation);

            // Thêm dòng mẫu (Sample data)
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue(1);
            sampleRow.createCell(1).setCellValue(""); // ID trống để hiểu là tạo mới
            sampleRow.createCell(2).setCellValue("Snack mặn");
            sampleRow.createCell(3).setCellValue("snack-man");
            sampleRow.createCell(4).setCellValue(""); // Root category
            sampleRow.createCell(5).setCellValue("Các loại đồ ăn vặt vị mặn");
            sampleRow.createCell(6).setCellValue("Hoạt động");

            // Auto size columns cho đẹp
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Ghi dữ liệu
            workbook.write(outputStream);
            outputStream.flush();
        }
    }
}
