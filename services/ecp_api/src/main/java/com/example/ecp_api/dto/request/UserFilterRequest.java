package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.users.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest {
    private String keyword;
    private String email;
    private String role;
    private List<String> roles;
    private Boolean active;
}
