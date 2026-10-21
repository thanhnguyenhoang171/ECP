package com.example.ecp_api.controller.system;

import com.example.ecp_api.dto.response.*;
import com.example.ecp_api.service.RecordRecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/deleted-records")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class RecordRecoveryController {
    private final RecordRecoveryService recovery;
    @GetMapping("/{module}")
    public ResponseEntity<PageResponse<RecordRecoveryService.DeletedRecord>> list(@PathVariable String module, Pageable pageable) {
        return ResponseEntity.ok(recovery.list(module, pageable));
    }
    @PostMapping("/{module}/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable String module, @PathVariable String id) {
        recovery.restore(module, id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Đã khôi phục bản ghi.").build());
    }
}
