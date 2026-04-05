package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserRequest userRequest);

    UserResponse toResponse(User user);
}
