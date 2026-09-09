package com.example.ecp_api.controller.product;

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
import com.example.ecp_api.exception.AppException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('product:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Products", description = "Product and Variant Management APIs")
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('product:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new product (JSON)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProductJson(@Valid @RequestBody ProductRequest request) {
        return new ResponseEntity<>(ApiResponse.<ProductResponse>builder()
                .success(true)
                .code("PRODUCT_CREATED_SUCCESS")
                .message("Product created successfully")
                .data(productService.createProduct(request, null, null)).build(), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('product:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new product (Multipart)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProductMultipart(
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "thumbnailFile", required = false) MultipartFile thumbnailFile,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) {
        return new ResponseEntity<>(ApiResponse.<ProductResponse>builder()
                .success(true)
                .code("PRODUCT_CREATED_SUCCESS")
                .message("Product created successfully")
                .data(productService.createProduct(request, thumbnailFile, imageFiles)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all products with filtering")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            ProductFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .code("PRODUCT_FETCHED_SUCCESS")
                .message("Product fetched successfully")
                .data(productService.getProductById(id)).build());
    }

    @GetMapping("/{id}/detail")
    @Operation(summary = "Get product composite details (Product, Brand, Category, Supplier, SKUs & Stocks)")
    public ResponseEntity<ApiResponse<com.example.ecp_api.dto.response.ProductDetailResponse>> getProductDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<com.example.ecp_api.dto.response.ProductDetailResponse>builder()
                .success(true)
                .code("PRODUCT_DETAIL_FETCHED_SUCCESS")
                .message("Product detail fetched successfully")
                .data(productService.getProductDetail(id)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('product:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update product details by ID (Partial update support)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .code("PRODUCT_UPDATED_SUCCESS")
                .message("Product updated successfully")
                .data(productService.updateProduct(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('product:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete product (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("PRODUCT_DELETED_SUCCESS")
                .message("Product deleted successfully")
                .build());
    }

    @GetMapping("/download-template")
    @PreAuthorize("hasAuthority('product:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Download template product for importing")
    public void downloadTemplateProduct(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String fileName = URLEncoder.encode("product_template", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName + ".xlsx");

        productService.downloadProductTemplate(response.getOutputStream());
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('product:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Export all products to Excel")
    public void exportProducts(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String fileName = URLEncoder.encode("export_products_" + System.currentTimeMillis(), StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + ".xlsx\"; filename*=UTF-8''" + fileName + ".xlsx");

        productService.exportAllProductToExcel(response.getOutputStream());
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('product:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Import products from Excel file")
    public ResponseEntity<ApiResponse<Void>> importProducts(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("FILE_REQUIRED", "Please select an Excel file to upload.", HttpStatus.BAD_REQUEST);
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
            throw new AppException("INVALID_FILE_TYPE", "Only supports Excel file formats (.xlsx, .xls).", HttpStatus.BAD_REQUEST);
        }

        productService.importProductFromExcel(file);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("PRODUCT_IMPORTED_SUCCESS")
                .message("Products imported successfully")
                .build());
    }
}
