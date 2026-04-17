package com.example.ecp_api.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class AddressResponse {
    private UUID id;
    private String recipientName;
    private String phone;
    private String province;
    private String district;
    private String ward;
    private String streetDetail;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
