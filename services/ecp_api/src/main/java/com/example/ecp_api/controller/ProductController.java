package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "APIs for managing products and their variants")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create a new product", description = "Creates a product with variants. SKU and Slug are auto-generated if not provided.")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        ApiResponse<ProductResponse> apiResponse = ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product created successfully")
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(
            summary = "Get all products",
            description = "Retrieve paginated products with advanced filtering. Supports filtering by ID, name, SKU, category ID, brand, and published status."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. name,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            ProductFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(filter, pageable));
    }
}
