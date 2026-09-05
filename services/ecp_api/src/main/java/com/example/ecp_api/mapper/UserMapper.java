package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.RegisterRequest;
import com.example.ecp_api.dto.request.UpdateMyAccountRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.entity.jpa.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Convert Request -> Entity (CREATE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "profile.firstName", source = "firstName")
    @Mapping(target = "profile.lastName", source = "lastName")
    @Mapping(target = "profile.phoneNumber", source = "phoneNumber")
    @Mapping(target = "profile.dob", source = "dob")
    @Mapping(target = "profile.gender", source = "gender")
    User toEntity(UserRequest userRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "profile.firstName", source = "firstName")
    @Mapping(target = "profile.lastName", source = "lastName")
    User toEntity(RegisterRequest registerRequest);


    // Convert Entity -> Response (READ)
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "provider", source = "provider")
    @Mapping(target = "phoneNumber", source = "profile.phoneNumber")
    @Mapping(target = "firstName", source = "profile.firstName")
    @Mapping(target = "lastName", source = "profile.lastName")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "avatarPublicId", source = "profile.avatarPublicId")
    @Mapping(target = "bannerUrl", source = "profile.bannerUrl")
    @Mapping(target = "bannerPublicId", source = "profile.bannerPublicId")
    @Mapping(target = "dob", source = "profile.dob")
    @Mapping(target = "gender", source = "profile.gender")
//    @Mapping(target = "loyaltyPoints", source = "profile.loyaltyPoints")
//    @Mapping(target = "membershipTier", source = "profile.membershipTier")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isEmailVerified", source = "emailVerified")
    @Mapping(target = "isPhoneVerified", source = "phoneVerified")
    @Mapping(target = "lastLoginAt", source = "lastLoginAt")
    @Mapping(target = "isOnline", ignore = true)
    @Mapping(target = "roles", ignore = true)
    UserResponse toResponse(User user);

    @org.mapstruct.AfterMapping
    default void mapRolesAndAudit(User user, @org.mapstruct.MappingTarget UserResponse userResponse) {
        if (user.getRoles() != null) {
            userResponse.setRoles(user.getRoles().stream()
                    .map(com.example.ecp_api.entity.jpa.Role::getCode)
                    .collect(java.util.stream.Collectors.toSet()));
        }
        if (user.getCreatedBy() != null && org.hibernate.Hibernate.isInitialized(user.getCreatedBy())) {
            userResponse.setCreatedBy(user.getCreatedBy().getEmail());
        }
        if (user.getUpdatedBy() != null && org.hibernate.Hibernate.isInitialized(user.getUpdatedBy())) {
            userResponse.setUpdatedBy(user.getUpdatedBy().getEmail());
        }
    }

    default PageResponse<UserResponse> toPageResponse(Page<User> page) {
        List<UserResponse> list = page.getContent().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());

        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<UserResponse>builder()
                .success(true)
                .message("Fetch users successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }


    // Update Entity from Request (UPDATE)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "profile.firstName", source = "firstName")
    @Mapping(target = "profile.lastName", source = "lastName")
    @Mapping(target = "profile.phoneNumber", source = "phoneNumber")
    @Mapping(target = "profile.avatarUrl", source = "avatarUrl")
    @Mapping(target = "profile.avatarPublicId", source = "avatarPublicId")
    @Mapping(target = "profile.dob", source = "dob")
    @Mapping(target = "profile.gender", source = "gender")
    void updateUserFromRequest(UserUpdateRequest request, @MappingTarget User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "passwordChangedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "profile.firstName", source = "firstName")
    @Mapping(target = "profile.lastName", source = "lastName")
    @Mapping(target = "profile.phoneNumber", source = "phoneNumber")
    @Mapping(target = "profile.avatarUrl", source = "avatarUrl")
    @Mapping(target = "profile.avatarPublicId", source = "avatarPublicId")
    @Mapping(target = "profile.bannerUrl", source = "bannerUrl")
    @Mapping(target = "profile.bannerPublicId", source = "bannerPublicId")
    @Mapping(target = "profile.dob", source = "dob")
    @Mapping(target = "profile.gender", source = "gender")
    void updateUserFromAccountRequest(UpdateMyAccountRequest request, @MappingTarget User user);
}