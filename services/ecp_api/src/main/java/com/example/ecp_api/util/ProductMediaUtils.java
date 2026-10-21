package com.example.ecp_api.util;

import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

public final class ProductMediaUtils {
    private static final Pattern MEDIA_ATTRIBUTE = Pattern.compile(
            "\\b(?:src|href|poster)\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", Pattern.CASE_INSENSITIVE);

    private ProductMediaUtils() {}

    // Copy values before mutating the product; shared URLs are represented only once.
    public static Map<String, String> collect(Product product) {
        Map<String, String> media = new LinkedHashMap<>();
        addImage(media, product.getThumbnail());
        if (product.getImages() != null) {
            product.getImages().forEach(image -> addImage(media, image));
        }
        if (product.getVideos() != null) {
            product.getVideos().stream().filter(java.util.Objects::nonNull)
                    .forEach(video -> add(media, video.getUrl(), video.getPublicId()));
        }
        if (product.getVariants() != null) {
            product.getVariants().stream().filter(java.util.Objects::nonNull)
                    .forEach(variant -> addImage(media, variant.getImage()));
        }
        if (StringUtils.hasText(product.getDescription())) {
            var matcher = MEDIA_ATTRIBUTE.matcher(product.getDescription());
            while (matcher.find()) {
                String value = matcher.group(1) != null ? matcher.group(1)
                        : matcher.group(2) != null ? matcher.group(2) : matcher.group(3);
                add(media, HtmlUtils.htmlUnescape(value), null);
            }
        }
        return media;
    }

    private static void addImage(Map<String, String> media, ProductImage image) {
        if (image != null) { add(media, image.getUrl(), image.getPublicId()); }
    }

    private static void add(Map<String, String> media, String url, String publicId) {
        if (StringUtils.hasText(url)) {
            String cleanUrl = url.trim();
            if (cleanUrl.startsWith("https://") || cleanUrl.startsWith("http://")) {
                if (!media.containsKey(cleanUrl) || StringUtils.hasText(publicId)) {
                    media.put(cleanUrl, publicId);
                }
            }
        }
    }
}
