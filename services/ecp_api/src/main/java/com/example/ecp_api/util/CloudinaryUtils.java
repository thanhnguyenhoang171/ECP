package com.example.ecp_api.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CloudinaryUtils {
//    Auto add f_auto (format) and q_auto (quality) into URL cloudinary
    public String optimizeURL(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return url;
        }
        // Structure of Cloudinary URL: .../upload/v1234567/sample.jpg
        // Must insert behind "/upload/"
        String target = "/upload/";
        if (url.contains(target)) {
            return url.replace(target, target + "f_auto,q_auto/");
        }
        return url;
    }

//    Optimize URL with specific size (thumbnail)
    public String createThumbnail(String url, int width, int height) {
        if (url == null || !url.contains("cloudinary.com")) {
            return url;
        }
        String target = "/upload/";
        String transformation = String.format("c_fill,g_auto,w_%d,h_%d,f_auto,q_auto/", width, height);

        if (url.contains(target)) {
            return url.replace(target, target + transformation);
        }
        return url; 
    }
}
