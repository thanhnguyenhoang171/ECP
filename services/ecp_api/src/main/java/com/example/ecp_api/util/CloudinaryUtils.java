package com.example.ecp_api.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CloudinaryUtils {
    public String optimizeURL(String url) {
        return url;
    }

    public String createThumbnail(String url, int width, int height) {
        return url;
    }

    public String extractPublicId(String url) {
        if (url == null) return null;
        if (url.contains("ecp_uploads/")) {
            return url.substring(url.indexOf("ecp_uploads/"));
        }
        return null;
    }
}
