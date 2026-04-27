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
import lombok.RequiredArgsConstructor;
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

import java.util.List;

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

        // 3. Auto generate SKU
        category.setSku(categoryHelper.generateSku(category.getName(), category.getParentId()));

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

        // 3. Regenerate SKU if name or parent changed
        if (parentChanged || !category.getName().equals(oldName)) {
            category.setSku(categoryHelper.generateSku(category.getName(), category.getParentId()));
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
            // Cập nhật luôn SKU của con nếu SKU cha thay đổi (theo quy tắc SKU cha + con)
            child.setSku(categoryHelper.generateSku(child.getName(), parent.getId()));
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
}
