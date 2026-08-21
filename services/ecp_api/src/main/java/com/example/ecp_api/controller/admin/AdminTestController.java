package com.example.ecp_api.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/test")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Test Management", description = "Super Admin: Endpoints for testing system error alerts & notifications")
public class AdminTestController {

    @GetMapping("/error")
    @Operation(summary = "Trigger test system error", description = "Throws a RuntimeException to test Telegram error log alert")
    public String triggerTestError() {
        throw new RuntimeException("Test Telegram Error Notification System triggered successfully!");
    }
}
