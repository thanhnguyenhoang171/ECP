package com.example.ecp_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetPurgePasswordRequest {
    @Size(max = 72, message = "Mật khẩu hiện tại tối đa 72 ký tự")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu xoá dữ liệu mới là bắt buộc")
    @Size(min = 8, max = 72, message = "Mật khẩu phải có từ 8 đến 72 ký tự")
    private String newPassword;
}
