package com.example.ecp_api.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file, String folder);
    List<Map> uploadMultiple(MultipartFile[] files, String folder);
    void delete(String url);
}
