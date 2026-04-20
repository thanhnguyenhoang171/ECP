package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.entity.jpa.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Convert Request -> Entity (CREATE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
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
    @Mapping(target = "profile.dob", source = "dob")
    @Mapping(target = "profile.gender", source = "gender")
    User toEntity(UserRequest userRequest);


    // Convert Entity -> Response (READ)
    @Mapping(target = "firstName", source = "profile.firstName")
    @Mapping(target = "lastName", source = "profile.lastName")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "dob", source = "profile.dob")
    @Mapping(target = "gender", source = "profile.gender")
    @Mapping(target = "loyaltyPoints", source = "profile.loyaltyPoints")
    @Mapping(target = "membershipTier", source = "profile.membershipTier")
    UserResponse toResponse(User user);


    // Update Entity from Request (UPDATE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "profile.firstName", source = "firstName")
    @Mapping(target = "profile.lastName", source = "lastName")
    @Mapping(target = "profile.dob", source = "dob")
    @Mapping(target = "profile.gender", source = "gender")
    void updateUserFromRequest(UserRequest request, @MappingTarget User user);
}