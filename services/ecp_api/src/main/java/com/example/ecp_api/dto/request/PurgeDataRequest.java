package com.example.ecp_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurgeDataRequest {
    @NotBlank(message = "Mật khẩu xoá dữ liệu là bắt buộc")
    @Size(max = 72, message = "Mật khẩu tối đa 72 ký tự")
    private String password;
}
