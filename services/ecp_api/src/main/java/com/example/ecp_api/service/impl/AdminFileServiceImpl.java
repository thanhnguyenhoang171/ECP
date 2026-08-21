package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.response.AdminFileResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.AdminFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminFileServiceImpl implements AdminFileService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<AdminFileResponse> getAllMediaFiles(String type, String keyword, int page, int size) {
        List<AdminFileResponse> allFiles = new ArrayList<>();

        int validPage = Math.max(1, page);
        int validSize = Math.max(1, Math.min(100, size));

        // 1. Scan User Avatars (MySQL / JPA)
        if (!StringUtils.hasText(type) || "ALL".equalsIgnoreCase(type) || "USER_AVATAR".equalsIgnoreCase(type)) {
            userRepository.findAll().forEach(user -> {
                if (user.getProfile() != null && StringUtils.hasText(user.getProfile().getAvatarUrl())) {
                    String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                    String lastName = user.getLastName() != null ? user.getLastName() : "";
                    String name = (firstName + " " + lastName).trim();
                    if (name.isEmpty()) {
                        name = user.getEmail();
                    }

                    allFiles.add(AdminFileResponse.builder()
                            .refId(user.getId().toString())
                            .type("USER_AVATAR")
                            .url(user.getProfile().getAvatarUrl())
                            .publicId(user.getProfile().getAvatarPublicId())
                            .refName(name)
                            .ownerEmail(user.getEmail())
                            .updatedAt(user.getUpdatedAt())
                            .build());
                }
            });
        }

        // 2. Scan Product Thumbnails & Images (MongoDB)
        if (!StringUtils.hasText(type) || "ALL".equalsIgnoreCase(type) || "PRODUCT".equalsIgnoreCase(type)) {
            productRepository.findAll().forEach(product -> {
                if (product.getThumbnail() != null && StringUtils.hasText(product.getThumbnail().getUrl())) {
                    allFiles.add(AdminFileResponse.builder()
                            .refId(product.getId())
                            .type("PRODUCT_THUMBNAIL")
                            .url(product.getThumbnail().getUrl())
                            .publicId(product.getThumbnail().getPublicId())
                            .refName(product.getName())
                            .ownerEmail(product.getCreatedBy())
                            .updatedAt(product.getUpdatedAt())
                            .build());
                }
                if (product.getImages() != null) {
                    product.getImages().forEach(img -> {
                        if (img != null && StringUtils.hasText(img.getUrl())) {
                            allFiles.add(AdminFileResponse.builder()
                                    .refId(product.getId())
                                    .type("PRODUCT_GALLERY")
                                    .url(img.getUrl())
                                    .publicId(img.getPublicId())
                                    .refName(product.getName())
                                    .ownerEmail(product.getCreatedBy())
                                    .updatedAt(product.getUpdatedAt())
                                    .build());
                        }
                    });
                }
            });
        }

        // 3. Scan Category Images (MongoDB)
        if (!StringUtils.hasText(type) || "ALL".equalsIgnoreCase(type) || "CATEGORY".equalsIgnoreCase(type)) {
            categoryRepository.findAll().forEach(category -> {
                if (category.getImage() != null && StringUtils.hasText(category.getImage().getUrl())) {
                    allFiles.add(AdminFileResponse.builder()
                            .refId(category.getId())
                            .type("CATEGORY_IMAGE")
                            .url(category.getImage().getUrl())
                            .publicId(category.getImage().getPublicId())
                            .refName(category.getName())
                            .ownerEmail(category.getCreatedBy())
                            .updatedAt(category.getUpdatedAt())
                            .build());
                }
            });
        }

        // Filter by keyword if present
        List<AdminFileResponse> filteredFiles = allFiles.stream()
                .filter(file -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.toLowerCase();
                    boolean matchName = file.getRefName() != null && file.getRefName().toLowerCase().contains(kw);
                    boolean matchPublicId = file.getPublicId() != null && file.getPublicId().toLowerCase().contains(kw);
                    boolean matchEmail = file.getOwnerEmail() != null && file.getOwnerEmail().toLowerCase().contains(kw);
                    return matchName || matchPublicId || matchEmail;
                })
                .toList();

        // Calculate pagination slices
        int totalElements = filteredFiles.size();
        int totalPages = totalElements > 0 ? (int) Math.ceil((double) totalElements / validSize) : 1;
        int start = Math.min((validPage - 1) * validSize, totalElements);
        int end = Math.min(start + validSize, totalElements);

        List<AdminFileResponse> pageContent = filteredFiles.subList(start, end);

        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(validPage)
                .pageSize(validSize)
                .totalElements((long) totalElements)
                .totalPages(totalPages)
                .isFirst(validPage == 1)
                .isLast(validPage >= totalPages)
                .build();

        return PageResponse.<AdminFileResponse>builder()
                .success(true)
                .message("Fetch media files successfully")
                .data(pageContent)
                .pagination(pagination)
                .build();
    }
}
