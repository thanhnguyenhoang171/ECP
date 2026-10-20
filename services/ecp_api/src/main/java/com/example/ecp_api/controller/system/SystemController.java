package com.example.ecp_api.controller.system;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.service.SystemService;
import com.example.ecp_api.service.PurgePasswordService;
import com.example.ecp_api.dto.request.PurgeDataRequest;
import com.example.ecp_api.dto.request.SetPurgePasswordRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import com.example.ecp_api.dto.response.PurgePasswordStatus;
import com.example.ecp_api.dto.response.PurgePasswordApproval;
import com.example.ecp_api.dto.request.ApprovePurgePasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/system")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('system:purge') or hasRole('SUPER_ADMIN')")
@Tag(name = "System", description = "System Maintenance APIs")
public class SystemController {

    private final SystemService systemService;
    private final PurgePasswordService purgePasswordService;

    @GetMapping("/purge-password")
    @Operation(summary = "Check whether the current user has configured a purge password")
    public ResponseEntity<ApiResponse<PurgePasswordStatus>> getPurgePasswordStatus() {
        return ResponseEntity.ok(ApiResponse.<PurgePasswordStatus>builder()
                .success(true).data(purgePasswordService.getStatus()).build());
    }

    @PatchMapping("/purge-password")
    @Operation(summary = "Create or change the current user's purge password")
    public ResponseEntity<ApiResponse<Void>> setPurgePassword(@Valid @RequestBody SetPurgePasswordRequest request) {
        purgePasswordService.setPassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true)
                .message("Đã cập nhật mật khẩu xoá dữ liệu").build());
    }

    @GetMapping("/purge-password/approvals")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PurgePasswordApproval>>> pendingApprovals() {
        return ResponseEntity.ok(ApiResponse.<List<PurgePasswordApproval>>builder()
                .success(true).data(purgePasswordService.pendingApprovals()).build());
    }

    @PostMapping("/purge-password/{userId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable UUID userId,
            @Valid @RequestBody ApprovePurgePasswordRequest request) {
        purgePasswordService.approve(userId, request.version());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true)
                .message("Đã duyệt mật khẩu xoá dữ liệu").build());
    }

    @PostMapping("/purge")
    @Operation(summary = "Purge system data and reinitialize default accounts; requires the current user's purge password")
    public ResponseEntity<ApiResponse<String>> purgeData(@Valid @RequestBody PurgeDataRequest request) {
        systemService.purgeAllData(request.getPassword());
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .code("SYSTEM_PURGED_SUCCESS")
                .message("All business data has been successfully purged")
                .data("Business data purged successfully")
                .build());
    }
}
