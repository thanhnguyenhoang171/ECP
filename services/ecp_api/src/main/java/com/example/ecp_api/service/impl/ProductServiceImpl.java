package com.example.ecp_api.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.exception.ExcelDataConvertException;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.example.ecp_api.dto.excel.ProductExcelDto;
import com.example.ecp_api.dto.excel.ProductExportExcelDto;
import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.entity.mongodb.Brand;
import com.example.ecp_api.entity.mongodb.Product;

import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.ProductMapper;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.ProductService;
import com.example.ecp_api.service.helper.ProductExcelHelper;
import com.example.ecp_api.util.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final com.example.ecp_api.repository.mongodb.BrandRepository brandRepository;
    private final SkuRepository skuRepository;
    private final com.example.ecp_api.repository.jpa.InventoryRepository inventoryRepository;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;
    private final com.example.ecp_api.mapper.BrandMapper brandMapper;
    private final com.example.ecp_api.mapper.CategoryMapper categoryMapper;
    private final com.example.ecp_api.mapper.SupplierMapper supplierMapper;
    private final com.example.ecp_api.repository.jpa.SupplierRepository supplierRepository;
    private final ProductExcelHelper productExcelHelper;

    @Override
    public PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable,
                Sort.Order.desc("createdAt"),
                Sort.Order.asc("id"));

        Query query = new Query().with(finalPageable);

        if (StringUtils.hasText(filter.getId())) {
            query.addCriteria(Criteria.where("_id").is(filter.getId()));
        }
        if (StringUtils.hasText(filter.getName())) {
            query.addCriteria(Criteria.where("name").regex(filter.getName(), "i"));
        }
        if (StringUtils.hasText(filter.getSku())) {
            query.addCriteria(Criteria.where("sku").regex(filter.getSku(), "i"));
        }
        if (StringUtils.hasText(filter.getCategoryId())) {
            query.addCriteria(Criteria.where("category_id").is(filter.getCategoryId()));
        }
        if (StringUtils.hasText(filter.getBrandId())) {
            query.addCriteria(Criteria.where("brand_id").is(filter.getBrandId()));
        }
        if (StringUtils.hasText(filter.getBrand())) {
            query.addCriteria(Criteria.where("brand").is(filter.getBrand()));
        }
        if (filter.getIsPublished() != null) {
            query.addCriteria(Criteria.where("is_published").is(filter.getIsPublished()));
        }
        if (filter.getIsFeatured() != null) {
            query.addCriteria(Criteria.where("is_featured").is(filter.getIsFeatured()));
        }
        if (filter.getIsNew() != null) {
            query.addCriteria(Criteria.where("is_new").is(filter.getIsNew()));
        }
        if (filter.getIsBestSeller() != null) {
            query.addCriteria(Criteria.where("is_best_seller").is(filter.getIsBestSeller()));
        }

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        Page<Product> productPage = new PageImpl<>(products, finalPageable, count);
        PageResponse<ProductResponse> pageResp = productMapper.toPageResponse(productPage);
        enrichCategoryInfo(pageResp.getData());
        return pageResp;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        return createProduct(request, null, null);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile thumbnailFile, List<MultipartFile> imageFiles) {
        com.example.ecp_api.dto.response.CloudinaryAsset uploadedThumbnail = cloudinaryService.uploadSafely(thumbnailFile, "products");
        List<com.example.ecp_api.dto.response.CloudinaryAsset> uploadedGallery = cloudinaryService.uploadMultipleSafely(imageFiles, "products");

        try {
            // Set thumbnail if uploaded
            if (uploadedThumbnail != null) {
                request.setThumbnail(ProductImage.builder()
                        .url(uploadedThumbnail.url())
                        .publicId(uploadedThumbnail.publicId())
                        .build());
            }

            // Set gallery images if uploaded
            if (!uploadedGallery.isEmpty()) {
                List<ProductImage> galleryImages = new ArrayList<>();
                if (request.getImages() != null) {
                    galleryImages.addAll(request.getImages());
                }
                for (com.example.ecp_api.dto.response.CloudinaryAsset asset : uploadedGallery) {
                    galleryImages.add(ProductImage.builder()
                            .url(asset.url())
                            .publicId(asset.publicId())
                            .build());
                }
                request.setImages(galleryImages);
            }

            // Validate Category
            if (StringUtils.hasText(request.getCategoryId())) {
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category Not Found", "CATEGORY_NOT_FOUND"));
            }

        // Validate & Resolve Brand
        String brandName = request.getBrand();
        if (StringUtils.hasText(request.getBrandId())) {
            com.example.ecp_api.entity.mongodb.Brand brandEntity = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand Not Found", "BRAND_NOT_FOUND"));
            if (!StringUtils.hasText(brandName)) {
                brandName = brandEntity.getName();
            }
        }

        // Handle SKU (Auto-generate if empty)
        String finalSku = request.getSku();
        if (!StringUtils.hasText(finalSku)) {
            finalSku = ProductUtils.generateSku(brandName, request.getName());
        }

        // Handle Slug (Auto-generate if empty)
        String finalSlug = request.getSlug();
        if (!StringUtils.hasText(finalSlug)) {
            finalSlug = SlugUtils.toSlug(request.getName());
        }

        // Validate SKU uniqueness
        if (productRepository.existsBySku(finalSku) || skuRepository.existsBySkuCode(finalSku)) {
            throw new AppException("SKU_EXISTS", "Mã SKU sản phẩm đã tồn tại: " + finalSku, HttpStatus.BAD_REQUEST);
        }

        // Map and save Product Master (MongoDB)
        Product product = productMapper.toEntity(request);
        product.setSku(finalSku);
        product.setSlug(finalSlug);
        if (StringUtils.hasText(brandName)) {
            product.setBrand(brandName);
        }

        product.setPublished(request.getIsPublished() != null ? request.getIsPublished() : false);

        product = productRepository.save(product); // Temp storage to get ID

        final String finalProductId = product.getId();
        final String productName = product.getName();

        // Handle Variants and create Sku in MySQL
        final String productSku = product.getSku();
        List<ProductVariant> variants = request.getVariants().stream().map(vReq -> {
            String vSku = vReq.getSku();
            if (!StringUtils.hasText(vSku)) {
                vSku = ProductUtils.generateVariantSku(productSku, vReq.getAttributes());
            }

            // Check SKU of Variant
            if (skuRepository.existsBySkuCode(vSku)) {
                throw new AppException("VARIANT_SKU_EXIST", "Mã SKU biến thể đã tồn tại: " + vSku,
                        HttpStatus.BAD_REQUEST);
            }
            // Create Sku Entity (MySQL)
            String vName = vReq.getAttributes() != null
                    ? String.join(" / ", vReq.getAttributes().values().stream().map(Object::toString).toList())
                    : "";

            Sku skuEntity = Sku.builder()
                    .skuCode(vSku)
                    .barcode(vReq.getBarcode())
                    .barcodeType(vReq.getBarcodeType())
                    .productId(finalProductId)
                    .productName(productName)
                    .variantName(vName)
                    .active(vReq.getIsActive() != null ? vReq.getIsActive() : true)
                    .variantId(UUID.randomUUID().toString())
                    .build();

            skuEntity = skuRepository.save(skuEntity);

            // Map to ProductVariant (Embedded Mongo)
            ProductVariant variant = productMapper.toVariantEntity(vReq);
            variant.setSku(vSku);
            variant.setProductId(finalProductId);
            variant.setSku_id(skuEntity.getId().toString());
            variant.setBarcodeType(vReq.getBarcodeType());
            variant.setImage(vReq.getImage());
            return variant;
        }).toList();

        // Update Product with full variants list
        product.setVariants(variants);
        product = productRepository.save(product);

        auditLogService.log("PRODUCT_CREATE", SecurityUtils.getCurrentUserEmail(),
                "Created product: " + product.getName());

        ProductResponse resp = productMapper.toResponse(product);
        enrichCategoryInfo(resp);
        return resp;
        } catch (Exception e) {
            cloudinaryService.rollbackSafely(uploadedThumbnail);
            cloudinaryService.rollbackAssetsSafely(uploadedGallery);
            throw e;
        }
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Not Found", "PRODUCT_NOT_FOUND"));
        ProductResponse resp = productMapper.toResponse(product);
        enrichCategoryInfo(resp);
        return resp;
    }

    @Override
    public com.example.ecp_api.dto.response.ProductDetailResponse getProductDetail(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Not Found", "PRODUCT_NOT_FOUND"));

        ProductResponse productResp = productMapper.toResponse(product);

        // Resolve Brand
        com.example.ecp_api.dto.response.BrandResponse brandResp = null;
        if (StringUtils.hasText(product.getBrandId())) {
            brandResp = brandRepository.findById(product.getBrandId())
                    .map(brandMapper::toResponse)
                    .orElse(null);
        }

        // Resolve Category
        com.example.ecp_api.dto.response.CategoryResponse categoryResp = null;
        if (StringUtils.hasText(product.getCategoryId())) {
            categoryResp = categoryRepository.findById(product.getCategoryId())
                    .map(categoryMapper::toResponse)
                    .orElse(null);
        }

        // Resolve SKUs and Inventory Counts
        List<Sku> skus = skuRepository.findByProductId(id);
        List<com.example.ecp_api.dto.response.ProductDetailResponse.SkuDetailItemResponse> skuDetails = new ArrayList<>();

        if (skus != null && !skus.isEmpty()) {
            for (Sku sku : skus) {
                Integer totalQty = inventoryRepository.sumQuantityOnHandBySkuId(sku.getId());
                if (totalQty == null) {
                    totalQty = 0;
                }

                ProductVariant matchingVariant = null;
                if (product.getVariants() != null) {
                    matchingVariant = product.getVariants().stream()
                            .filter(v -> sku.getId().toString().equals(v.getSku_id()) || sku.getSkuCode().equals(v.getSku()))
                            .findFirst()
                            .orElse(null);
                }

                BigDecimal price = matchingVariant != null && matchingVariant.getPrice() != null 
                        ? matchingVariant.getPrice() : BigDecimal.ZERO;
                BigDecimal costPrice = matchingVariant != null && matchingVariant.getCostPrice() != null 
                        ? matchingVariant.getCostPrice() : BigDecimal.ZERO;
                BigDecimal compareAtPrice = matchingVariant != null && matchingVariant.getCompareAtPrice() != null 
                        ? matchingVariant.getCompareAtPrice() : BigDecimal.ZERO;
                Map<String, Object> attributes = matchingVariant != null && matchingVariant.getAttributes() != null 
                        ? matchingVariant.getAttributes() : new HashMap<>();

                skuDetails.add(com.example.ecp_api.dto.response.ProductDetailResponse.SkuDetailItemResponse.builder()
                        .id(sku.getId().toString())
                        .skuCode(sku.getSkuCode())
                        .variantName(sku.getVariantName())
                        .barcode(sku.getBarcode())
                        .barcodeType(sku.getBarcodeType())
                        .price(price)
                        .costPrice(costPrice)
                        .compareAtPrice(compareAtPrice)
                        .stockQuantity(totalQty)
                        .active(sku.isActive())
                        .attributes(attributes)
                        .build());
            }
        } else if (product.getVariants() != null) {
            // Fallback to embedded ProductVariants if MySQL Sku entries are not created yet
            for (ProductVariant v : product.getVariants()) {
                skuDetails.add(com.example.ecp_api.dto.response.ProductDetailResponse.SkuDetailItemResponse.builder()
                        .id(v.getSku_id() != null ? v.getSku_id() : UUID.randomUUID().toString())
                        .skuCode(v.getSku())
                        .variantName(v.getSku())
                        .barcode(v.getBarcode())
                        .barcodeType(v.getBarcodeType())
                        .price(v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO)
                        .costPrice(v.getCostPrice() != null ? v.getCostPrice() : BigDecimal.ZERO)
                        .compareAtPrice(v.getCompareAtPrice() != null ? v.getCompareAtPrice() : BigDecimal.ZERO)
                        .stockQuantity(0)
                        .active(v.isActive())
                        .attributes(v.getAttributes() != null ? v.getAttributes() : new HashMap<>())
                        .build());
            }
        }

        return com.example.ecp_api.dto.response.ProductDetailResponse.builder()
                .product(productResp)
                .brand(brandResp)
                .category(categoryResp)
                .supplier(null)
                .skus(skuDetails)
                .build();
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Not Found", "PRODUCT_NOT_FOUND"));

        if (StringUtils.hasText(request.getName())) {
            existingProduct.setName(request.getName());
            if (!StringUtils.hasText(request.getSlug())) {
                existingProduct.setSlug(SlugUtils.toSlug(request.getName()));
            }
        }

        if (StringUtils.hasText(request.getSlug())) {
            existingProduct.setSlug(SlugUtils.toSlug(request.getSlug()));
        }

        if (StringUtils.hasText(request.getSku())) {
            existingProduct.setSku(request.getSku());
        }

        if (StringUtils.hasText(request.getBrand())) {
            existingProduct.setBrand(request.getBrand());
        }

        if (StringUtils.hasText(request.getBrandId())) {
            existingProduct.setBrandId(request.getBrandId());
        }

        if (StringUtils.hasText(request.getCategoryId())) {
            existingProduct.setCategoryId(request.getCategoryId());
        }

        if (request.getDescription() != null) {
            existingProduct.setDescription(request.getDescription());
        }

        if (request.getThumbnail() != null) {
            existingProduct.setThumbnail(request.getThumbnail());
        }

        if (request.getImages() != null) {
            existingProduct.setImages(request.getImages());
        }

        if (request.getSpecifications() != null) {
            existingProduct.setSpecifications(request.getSpecifications());
        }

        if (request.getIsPublished() != null) {
            existingProduct.setPublished(request.getIsPublished());
        }

        if (request.getIsFeatured() != null) {
            existingProduct.setFeatured(request.getIsFeatured());
        }

        if (request.getIsNew() != null) {
            existingProduct.setNew(request.getIsNew());
        }

        if (request.getIsBestSeller() != null) {
            existingProduct.setBestSeller(request.getIsBestSeller());
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> updatedVariants = new ArrayList<>();
            for (ProductRequest.ProductVariantRequest varReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .sku(StringUtils.hasText(varReq.getSku()) ? varReq.getSku() : ProductUtils.generateVariantSku(existingProduct.getSku(), varReq.getAttributes()))
                        .barcode(varReq.getBarcode())
                        .barcodeType(varReq.getBarcodeType())
                        .price(varReq.getPrice())
                        .costPrice(varReq.getCostPrice())
                        .compareAtPrice(varReq.getCompareAtPrice())
                        .attributes(varReq.getAttributes())
                        .image(varReq.getImage())
                        .active(varReq.getIsActive() != null ? varReq.getIsActive() : true)
                        .build();
                updatedVariants.add(variant);
            }
            existingProduct.setVariants(updatedVariants);
        }

        String operatorEmail = SecurityUtils.getCurrentUsername();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            existingProduct.setUpdatedBy(operatorEmail);
        }

        existingProduct = productRepository.save(existingProduct);

        auditLogService.log("PRODUCT_UPDATE", operatorEmail, "Updated product: " + existingProduct.getName() + " (ID: " + existingProduct.getId() + ")");

        ProductResponse resp = productMapper.toResponse(existingProduct);
        enrichCategoryInfo(resp);
        return resp;
    }

    @Override
    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Not Found", "PRODUCT_NOT_FOUND"));

        String operatorEmail = SecurityUtils.getCurrentUsername();
        productRepository.delete(product);

        auditLogService.log("PRODUCT_DELETE", operatorEmail, "Hard deleted product: " + product.getName() + " (ID: " + product.getId() + ")");
    }

    @Override
    @Transactional
    public void updateVariantCostPriceMAC(String skuId, int addedQuantity, BigDecimal newUnitCost) {
        Sku sku = skuRepository.findById(UUID.fromString(skuId))
                .orElseThrow(() -> new ResourceNotFoundException("Sku Not Found", "SKU_NOT_FOUND"));

        Product product = productRepository.findById(sku.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product Not Found", "PRODUCT_NOT_FOUND"));

        // Get total quantity currently in stock across all warehouses
        Integer currentTotalQuantity = inventoryRepository.sumQuantityOnHandBySkuId(sku.getId());
        if (currentTotalQuantity == null) {
            currentTotalQuantity = 0;
        }
        
        // Since the receipt might have already adjusted inventory, the currentTotalQuantity INCLUDES addedQuantity?
        // Wait! If this is called AFTER inventoryService.adjustInventory(), then currentTotalQuantity ALREADY includes addedQuantity.
        // So previous quantity = currentTotalQuantity - addedQuantity.
        int previousQuantity = currentTotalQuantity - addedQuantity;
        if (previousQuantity < 0) {
            previousQuantity = 0; // fallback in case of negative stock anomalies
        }

        boolean updated = false;
        for (ProductVariant variant : product.getVariants()) {
            if (variant.getSku_id() != null && variant.getSku_id().equals(skuId)) {
                BigDecimal currentCostPrice = variant.getCostPrice() != null ? variant.getCostPrice() : BigDecimal.ZERO;
                
                // Formula: ((previousQuantity * currentCostPrice) + (addedQuantity * newUnitCost)) / currentTotalQuantity
                BigDecimal totalPreviousValue = currentCostPrice.multiply(new BigDecimal(previousQuantity));
                BigDecimal totalAddedValue = newUnitCost.multiply(new BigDecimal(addedQuantity));
                BigDecimal newTotalValue = totalPreviousValue.add(totalAddedValue);
                
                BigDecimal newMac = BigDecimal.ZERO;
                if (currentTotalQuantity > 0) {
                    newMac = newTotalValue.divide(new BigDecimal(currentTotalQuantity), 2, RoundingMode.HALF_UP);
                }
                
                variant.setCostPrice(newMac);
                updated = true;
                break;
            }
        }

        if (updated) {
            productRepository.save(product);
        }
    }

    private void enrichCategoryInfo(ProductResponse response) {
        if (response == null) return;
        enrichCategoryInfo(List.of(response));
    }

    private void enrichCategoryInfo(List<ProductResponse> responses) {
        if (responses == null || responses.isEmpty()) return;

        List<String> categoryIds = responses.stream()
                .map(ProductResponse::getCategoryId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        Map<String, String> categoryNameMap = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds)
                    .forEach(cat -> categoryNameMap.put(cat.getId(), cat.getName()));
        }

        for (ProductResponse resp : responses) {
            if (StringUtils.hasText(resp.getCategoryId())) {
                String catName = categoryNameMap.get(resp.getCategoryId());
                resp.setCategory(ProductResponse.CategoryInfo.builder()
                        .id(resp.getCategoryId())
                        .name(catName)
                        .build());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void downloadProductTemplate(OutputStream outputStream) {
        List<ProductExcelDto> samples = List.of(
                ProductExcelDto.builder()
                        .index(1)
                        .sku("TKN-ROLL-SPICY")
                        .name("Rong biển cuộn Tao Kae Noi Big Roll vị cay")
                        .slug("rong-bien-cuon-tao-kae-noi-big-roll-vi-cay")
                        .brand("Tao Kae Noi")
                        .category("Rong biển sấy & nướng giòn")
                        .price(new BigDecimal("12000"))
                        .compareAtPrice(new BigDecimal("15000"))
                        .costPrice(new BigDecimal("8500"))
                        .description("Rong biển nướng cuộn tròn giòn rụm, tẩm gia vị cay đặc trưng thơm nồng.")
                        .published(true)
                        .imageUrl("")
                        .build(),
                ProductExcelDto.builder()
                        .index(2)
                        .sku("BENTO-SQUID-RED")
                        .name("Mực Bento Thái Lan gói đỏ vị cay ngọt 20g")
                        .slug("muc-bento-thai-lan-goi-do-vi-cay-ngot-20g")
                        .brand("Bento")
                        .category("Mực & Hải sản cay tẩm vị")
                        .price(new BigDecimal("28000"))
                        .compareAtPrice(new BigDecimal("32000"))
                        .costPrice(new BigDecimal("20000"))
                        .description("Mực khô tẩm gia vị ớt cay ngọt chuẩn vị đường phố Thái Lan, dai giòn đậm đà.")
                        .published(true)
                        .imageUrl("")
                        .build(),
                ProductExcelDto.builder()
                        .index(3)
                        .sku("LAYS-TOMYUM-75G")
                        .name("Snack khoai tây Lay's vị súp tôm Tom Yum 75g")
                        .slug("snack-khoai-tay-lays-vi-sup-tom-tom-yum-75g")
                        .brand("Lay's Thailand")
                        .category("Snack khoai tây & Bánh que")
                        .price(new BigDecimal("35000"))
                        .compareAtPrice(new BigDecimal("39000"))
                        .costPrice(new BigDecimal("25000"))
                        .description("Khoai tây giòn rụm kết hợp cùng hương vị chua cay béo thơm của súp tôm Tom Yum Kung Thái.")
                        .published(true)
                        .imageUrl("")
                        .build()
        );

        EasyExcel.write(outputStream, ProductExcelDto.class)
                .registerWriteHandler(new SheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder, WriteSheetHolder writeSheetHolder) {
                        Sheet sheet = writeSheetHolder.getSheet();
                        sheet.createFreezePane(0, 1);
                    }
                })
                .sheet("products")
                .doWrite(samples);
    }

    @Override
    @Transactional
    public void importProductFromExcel(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            Map<Integer, byte[]> rowImages = ExcelImageExtractor.extractImagesByRow(fileBytes);

            List<ProductExcelDto> dataList = new ArrayList<>();
            List<String> errorMessages = new ArrayList<>();

            EasyExcel.read(new ByteArrayInputStream(fileBytes), ProductExcelDto.class, new ReadListener<ProductExcelDto>() {
                @Override
                public void invoke(ProductExcelDto data, AnalysisContext context) {
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

            int successCount = 0;
            for (ProductExcelDto dto : dataList) {
                try {
                    productExcelHelper.upsertProductForImport(dto);
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

            auditLogService.log("PRODUCT_IMPORT", SecurityUtils.getCurrentUserEmail(), "Imported " + successCount + " products from Excel");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("PRODUCT_IMPORT_FAILED", "Failed to process file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void exportAllProductToExcel(OutputStream outputStream) {
        List<Product> allProducts = productRepository.findAll();
        AtomicInteger index = new AtomicInteger(1);

        List<String> categoryIds = allProducts.stream()
                .map(Product::getCategoryId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        Map<String, String> categoryNameMap = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds)
                    .forEach(cat -> categoryNameMap.put(cat.getId(), cat.getName()));
        }

        List<ProductExportExcelDto> excelDtos = allProducts.stream()
                .map(p -> {
                    URL parsedThumbUrl = null;
                    try {
                        if (p.getThumbnail() != null && StringUtils.hasText(p.getThumbnail().getUrl())) {
                            parsedThumbUrl = new URL(p.getThumbnail().getUrl());
                        }
                    } catch (Exception ignored) {
                    }

                    BigDecimal price = BigDecimal.ZERO;
                    BigDecimal compareAtPrice = null;
                    BigDecimal costPrice = null;
                    if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                        ProductVariant v = p.getVariants().get(0);
                        if (v.getPrice() != null) {
                            price = v.getPrice();
                        }
                        compareAtPrice = v.getCompareAtPrice();
                        costPrice = v.getCostPrice();
                    }

                    String categoryName = StringUtils.hasText(p.getCategoryId())
                            ? categoryNameMap.getOrDefault(p.getCategoryId(), p.getCategoryId())
                            : "";

                    return ProductExportExcelDto.builder()
                            .index(index.getAndIncrement())
                            .id(p.getId())
                            .sku(p.getSku())
                            .name(p.getName())
                            .slug(p.getSlug())
                            .brand(StringUtils.hasText(p.getBrand()) ? p.getBrand() : "")
                            .category(categoryName)
                            .price(price)
                            .compareAtPrice(compareAtPrice)
                            .costPrice(costPrice)
                            .thumbnail(parsedThumbUrl)
                            .status(p.isPublished() ? "Published" : "Draft")
                            .soldCount(p.getSoldCount())
                            .createdAt(p.getCreatedAt() != null ? DateTimeUtils.format(p.getCreatedAt()) : "")
                            .build();
                })
                .toList();

        EasyExcel.write(outputStream, ProductExportExcelDto.class)
                .sheet("Products")
                .doWrite(excelDtos);
    }
}
