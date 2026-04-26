package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.users.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest {
    private String username;
    private String email;
    private UserRole role;
    private Boolean active;
}
