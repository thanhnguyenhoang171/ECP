package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsResponse {
    private long activeUsers;
    private long inactiveUsers;
    private long superAdminUsers;
    private long managerUsers;
    private long totalUsers;
    private long onlineUsers;
    private long offlineUsers;
    private long managementUsers; // SUPER_ADMIN + MANAGER
    private long customerUsers;   // USER
}
