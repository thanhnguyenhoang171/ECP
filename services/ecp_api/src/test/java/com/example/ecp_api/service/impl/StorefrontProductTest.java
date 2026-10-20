package com.example.ecp_api.service.impl;

import com.example.ecp_api.controller.storefront.StorefrontProductController;
import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.ProductMapper;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StorefrontProductTest {
    @Mock ProductRepository repository;
    @Mock ProductMapper mapper;
    @InjectMocks ProductServiceImpl service;

    @Test
    void resolvesPublishedProductByExactSlug() {
        Product product = Product.builder().id("p1").slug("cacao-70").published(true).build();
        ProductResponse response = ProductResponse.builder().id("p1").build();
        when(repository.findBySlug("cacao-70")).thenReturn(Optional.of(product));
        when(mapper.toResponse(product)).thenReturn(response);
        assertSame(response, service.getStorefrontProduct("cacao-70"));
        verify(repository, never()).findById(anyString());
    }

    @Test
    void unpublishedProductCannotBeReadByIdOrSlug() {
        Product hidden = Product.builder().id("p1").published(false).build();
        when(repository.findBySlug("hidden")).thenReturn(Optional.of(hidden));
        assertThrows(ResourceNotFoundException.class, () -> service.getStorefrontProduct("hidden"));
        when(repository.findBySlug("p1")).thenReturn(Optional.empty());
        when(repository.findById("p1")).thenReturn(Optional.of(hidden));
        assertThrows(ResourceNotFoundException.class, () -> service.getStorefrontProduct("p1"));
        verifyNoInteractions(mapper);
    }

    @Test
    void missingProductReturnsNotFound() {
        when(repository.findBySlug("missing")).thenReturn(Optional.empty());
        when(repository.findById("missing")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getStorefrontProduct("missing"));
    }

    @Test
    void publicCatalogOverridesRequestedVisibilityAndPreservesOtherFilters() {
        ProductService productService = mock(ProductService.class);
        var controller = new StorefrontProductController(productService);
        var filter = ProductFilterRequest.builder().isPublished(false).categoryId("cat1").isNew(true).build();
        var pageable = PageRequest.of(0, 10);
        controller.getAllProducts(filter, pageable);
        assertEquals(Boolean.TRUE, filter.getIsPublished());
        assertEquals("cat1", filter.getCategoryId());
        assertEquals(Boolean.TRUE, filter.getIsNew());
        verify(productService).getAllProducts(filter, pageable);
    }
}
