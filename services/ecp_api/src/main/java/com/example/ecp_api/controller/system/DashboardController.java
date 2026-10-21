package com.example.ecp_api.controller.system;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.DashboardOverviewResponse;
import com.example.ecp_api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER') or hasAuthority('dashboard:read')")
@Tag(name = "Dashboard", description = "Admin Dashboard Analytics & Overview APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    @Operation(summary = "Get overview statistics, recent orders, top products, and revenue chart for admin dashboard")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getOverview(
            @RequestParam(name = "period", defaultValue = "12m") String period) {
        DashboardOverviewResponse data = dashboardService.getOverview(period);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy dữ liệu tổng quan thành công"));
    }
}
