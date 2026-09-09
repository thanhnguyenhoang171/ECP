package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.excel.ProductExcelDto;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.entity.mongodb.Brand;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.repository.mongodb.BrandRepository;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductExcelHelper {
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final SkuRepository skuRepository;

    public void upsertProductForImport(ProductExcelDto dto) {
        if (!StringUtils.hasText(dto.getName())) {
            throw new AppException("NAME_REQUIRED" , "Column 'Product Name' cannot be empty", HttpStatus.BAD_REQUEST);
        }

        if (dto.getPrice()==null || dto.getPrice().compareTo(BigDecimal.ZERO)<=0) {
            throw new AppException("PRICE_INVALID", "Column 'Price' is required and must be greater than 0", HttpStatus.BAD_REQUEST);
        }

        String sku = StringUtils.hasText(dto.getSku()) ? dto.getSku().trim().toUpperCase() : "PROD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String slug = StringUtils.hasText(dto.getSlug()) ? dto.getSlug().trim().toLowerCase() : SlugUtils.toSlug(dto.getName().trim());

        Product existingProduct = productRepository.findBySlug(slug).orElse(productRepository.findBySku(sku).orElse(null));

        Product product;
        if (existingProduct != null) {
            product = existingProduct; // update
        } else {
            product = new Product(); //creat new product
            product.setSku(sku);
        }

        // Assign basic information
        product.setName(dto.getName().trim());
        product.setSlug(slug);
        product.setDescription(dto.getDescription());
        product.setPublished(dto.getPublished() !=null ? dto.getPublished() : true);

        String rawCategory = StringUtils.hasText(dto.getCategory()) ? dto.getCategory().trim() : (StringUtils.hasText(dto.getCategorySlug()) ? dto.getCategorySlug().trim() : null);
        if (StringUtils.hasText(rawCategory)) {
            Category category = categoryRepository.findByNameAndDeletedFalse(rawCategory)
                    .orElseGet(() -> categoryRepository.findBySlugAndDeletedFalse(rawCategory)
                            .orElseGet(() -> categoryRepository.findBySlugAndDeletedFalse(SlugUtils.toSlug(rawCategory))
                                    .orElse(null)));

            if (category == null) {
                throw new AppException("CATEGORY_NOT_FOUND", "Category '" + rawCategory + "' does not exist", HttpStatus.BAD_REQUEST);
            }
            product.setCategoryId(category.getId());
        }

        if (StringUtils.hasText(dto.getBrand())) {
            String rawBrand = dto.getBrand().trim();
            Brand brand = brandRepository.findByNameAndDeletedFalse(rawBrand)
                    .orElseGet(() -> brandRepository.findBySlugAndDeletedFalse(rawBrand)
                            .orElseGet(() -> brandRepository.findBySlugAndDeletedFalse(SlugUtils.toSlug(rawBrand))
                                    .orElse(null)));

            if (brand != null) {
                product.setBrandId(brand.getId());
                product.setBrand(brand.getName());
            } else {
                product.setBrand(rawBrand);
            }
        }

        if (dto.getEmbeddedImageBytes() != null && dto.getEmbeddedImageBytes().length > 0) {
            CloudinaryAsset asset = cloudinaryService.uploadSafely(dto.getEmbeddedImageBytes(), "products");
            if (asset == null) {
                throw new AppException("IMAGE_UPLOAD_FAILDED", "Failed to upload image to Cloudinary for product '" + dto.getName() + "'. Please check Cloudinary configuration or netword connection.", HttpStatus.BAD_REQUEST);
            }
            product.setThumbnail(ProductImage.builder()
                    .url(asset.url())
                    .publicId(asset.publicId())
                    .build());
        } else if (StringUtils.hasText(dto.getImageUrl())) {
            CloudinaryAsset asset = cloudinaryService.uploadFromUrlSafely(dto.getImageUrl(), "products");
            if (asset != null) {
                product.setThumbnail(ProductImage.builder()
                        .url(asset.url())
                        .publicId(asset.publicId())
                        .build());
            } else if (dto.getImageUrl().trim().startsWith("http")) {
                product.setThumbnail(ProductImage.builder()
                        .url(dto.getImageUrl().trim())
                        .build());
            }
        }

        product =productRepository.save(product);
        final String finalProductId = product.getId();

        Sku skuEntity = skuRepository.findBySkuCode(sku).orElse(null);
        if (skuEntity == null) {
            skuEntity = Sku.builder()
                    .skuCode(sku)
                    .productId(finalProductId)
                    .productName(product.getName())
                    .variantName("Default")
                    .variantId(UUID.randomUUID().toString())
                    .active(true)
                    .build();
            skuEntity  = skuRepository.save(skuEntity);
        } else {
            skuEntity.setProductName(product.getName());
            skuEntity.setProductId(finalProductId);
            skuRepository.save(skuEntity);
        }

        List<ProductVariant> variants = product.getVariants();
        if (variants != null && !variants.isEmpty()) {
            ProductVariant firstVariant = variants.get(0);
            firstVariant.setPrice(dto.getPrice());
            firstVariant.setSku_id(skuEntity.getId().toString());
            if (dto.getCostPrice() != null) firstVariant.setCostPrice(dto.getCostPrice());
            if (dto.getCompareAtPrice() != null) firstVariant.setCompareAtPrice(dto.getCompareAtPrice());
            if (product.getThumbnail() != null) firstVariant.setImage(product.getThumbnail());
        } else
        {
            ProductVariant defaultVariant = ProductVariant.builder()
                    .sku(sku)
                    .sku_id(skuEntity.getId().toString())
                    .productId(finalProductId)
                    .price(dto.getPrice())
                    .costPrice(dto.getCostPrice())
                    .compareAtPrice(dto.getCompareAtPrice())
                    .image(product.getThumbnail())
                    .active(true)
                    .build();
            List<ProductVariant> newVariants = new ArrayList<>();
            newVariants.add(defaultVariant);
            product.setVariants(newVariants);
        }

        productRepository.save(product);
    }
}
