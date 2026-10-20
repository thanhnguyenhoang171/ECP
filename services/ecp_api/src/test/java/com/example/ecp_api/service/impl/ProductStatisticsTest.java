package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.mapper.ProductMapper;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.AuditLogService;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductStatisticsTest {
    @Mock ProductRepository productRepository;
    @Mock ProductMapper productMapper;
    @Mock AuditLogService auditLogService;
    @InjectMocks ProductServiceImpl service;

    @Test
    void updatesStatisticsAndAllowsResettingToZeroAndFalse() {
        Product product = Product.builder().id("p1").name("Product").build();
        when(productRepository.findById("p1")).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);

        service.updateProduct("p1", ProductRequest.builder()
                .isPublished(true).isFeatured(true).isNew(true).isBestSeller(true)
                .viewCount(100).soldCount(20).ratingAvg(new BigDecimal("4.7")).ratingCount(10).build());
        assertAll(
                () -> assertTrue(product.isPublished()),
                () -> assertTrue(product.isFeatured()),
                () -> assertTrue(product.isNew()),
                () -> assertTrue(product.isBestSeller()),
                () -> assertEquals(100, product.getViewCount()),
                () -> assertEquals(20, product.getSoldCount()),
                () -> assertEquals(new BigDecimal("4.7"), product.getRatingAvg()),
                () -> assertEquals(10, product.getRatingCount()));

        service.updateProduct("p1", ProductRequest.builder()
                .isPublished(false).isFeatured(false).isNew(false).isBestSeller(false)
                .viewCount(0).soldCount(0).ratingAvg(BigDecimal.ZERO).ratingCount(0).build());
        assertAll(
                () -> assertFalse(product.isPublished()),
                () -> assertFalse(product.isFeatured()),
                () -> assertFalse(product.isNew()),
                () -> assertFalse(product.isBestSeller()),
                () -> assertEquals(0, product.getViewCount()),
                () -> assertEquals(0, product.getSoldCount()),
                () -> assertEquals(BigDecimal.ZERO, product.getRatingAvg()),
                () -> assertEquals(0, product.getRatingCount()));
        verify(productRepository, times(2)).save(product);
    }

    @Test
    void omittedStatisticsArePreservedDuringPartialUpdate() {
        Product product = Product.builder().id("p1").name("Product")
                .viewCount(100).soldCount(20).ratingAvg(new BigDecimal("4.7")).ratingCount(10).build();
        when(productRepository.findById("p1")).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);
        service.updateProduct("p1", ProductRequest.builder().description("Updated description").build());
        assertAll(
                () -> assertEquals(100, product.getViewCount()),
                () -> assertEquals(20, product.getSoldCount()),
                () -> assertEquals(new BigDecimal("4.7"), product.getRatingAvg()),
                () -> assertEquals(10, product.getRatingCount()));
    }

    @Test
    void creationMappingAndResponseRetainAllStatusAndStatistics() {
        ProductMapper mapper = Mappers.getMapper(ProductMapper.class);
        Product product = mapper.toEntity(ProductRequest.builder()
                .isPublished(true).isFeatured(true).isNew(true).isBestSeller(true)
                .viewCount(100).soldCount(20).ratingAvg(new BigDecimal("4.7")).ratingCount(10).build());
        var response = mapper.toResponse(product);
        assertAll(
                () -> assertTrue(response.isPublished()),
                () -> assertTrue(response.isFeatured()),
                () -> assertTrue(response.isNew()),
                () -> assertTrue(response.isBestSeller()),
                () -> assertEquals(100, response.getViewCount()),
                () -> assertEquals(20, response.getSoldCount()),
                () -> assertEquals(new BigDecimal("4.7"), response.getRatingAvg()),
                () -> assertEquals(10, response.getRatingCount()));
    }

    @Test
    void rejectsNegativeCountersAndOutOfRangeRating() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var request = ProductRequest.builder().viewCount(-1).soldCount(-1)
                    .ratingCount(-1).ratingAvg(new BigDecimal("5.1")).build();
            Set<String> fields = validator.validate(request).stream()
                    .map(violation -> violation.getPropertyPath().toString()).collect(Collectors.toSet());
            assertTrue(fields.containsAll(Set.of("viewCount", "soldCount", "ratingCount", "ratingAvg")));
            assertFalse(validator.validateProperty(ProductRequest.builder().ratingAvg(new BigDecimal("-0.1")).build(), "ratingAvg").isEmpty());
            assertTrue(validator.validateProperty(ProductRequest.builder().ratingAvg(BigDecimal.ZERO).build(), "ratingAvg").isEmpty());
            assertTrue(validator.validateProperty(ProductRequest.builder().ratingAvg(new BigDecimal("5")).build(), "ratingAvg").isEmpty());
        }
    }
}
