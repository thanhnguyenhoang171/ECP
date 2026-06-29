package com.example.ecp_api.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.util.CloudinaryUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    public Map upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        try {
            String folderPath = "ecp_uploads";
            if (folder != null && !folder.trim().isEmpty()) {
                String subFolder = folder.trim();
                while (subFolder.startsWith("/")) {
                    subFolder = subFolder.substring(1);
                }
                while (subFolder.endsWith("/")) {
                    subFolder = subFolder.substring(0, subFolder.length() - 1);
                }
                if (!subFolder.isEmpty()) {
                    folderPath = folderPath + "/" + subFolder;
                }
            }
            // Upload to cloudinary
            Map uploadResult  = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));

            // Get secure_url and optimized it by util
            String secureUrl = (String) uploadResult.get("secure_url");
            String optimizeUrl = CloudinaryUtils.optimizeURL(secureUrl);

            // Update result map to return opt URL
            uploadResult.put("secure_url", optimizeUrl);

            log.info("Upload file successfully : {}", optimizeUrl);

            return uploadResult;
        } catch (IOException e) {
            log.error("Errors when uploading file to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Cannot upload file to Cloudinary");
        }
    }

    @Override
    public List<Map> uploadMultiple(MultipartFile[] files, String folder) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }
        List<Map> uploadResults = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                uploadResults.add(this.upload(file, folder));
            }
        }

        log.info("Upload multiple files successfully : {}", uploadResults);

        return uploadResults;
    }

    public void delete(String publicId){
        try {
            this.cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Delete file successfully : {}", publicId);
        } catch (IOException e) {
            log.error("Errors when deleting file from Cloudinary: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
    
}
