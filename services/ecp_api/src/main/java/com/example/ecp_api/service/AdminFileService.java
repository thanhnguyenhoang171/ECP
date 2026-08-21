package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.AdminFileResponse;
import com.example.ecp_api.dto.response.PageResponse;

public interface AdminFileService {
    PageResponse<AdminFileResponse> getAllMediaFiles(String type, String keyword, int page, int size);
}
