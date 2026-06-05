package com.example.ecp_api.util;

import org.springframework.util.StringUtils;
import java.util.UUID;

public class ProductUtils {

    private ProductUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Generate an automatic SKU based on brand and name.
     * Format: [BRAND_PART]-[NAME_PART]-[RANDOM_SUFFIX]
     *
     * @param brand the product brand
     * @param name  the product name
     * @return a generated SKU string
     */
    public static String generateSku(String brand, String name) {
        // ... (existing code remains the same)
        String brandPrefix = StringUtils.hasText(brand)
                ? brand.toUpperCase().replaceAll("[^A-Z0-9]", "")
                : "PROD";

        if (brandPrefix.length() > 4) {
            brandPrefix = brandPrefix.substring(0, 4);
        }

        String namePart = StringUtils.hasText(name)
                ? name.toUpperCase().replaceAll("[^A-Z0-9]", "")
                : "ITEM";

        if (namePart.length() > 5) {
            namePart = namePart.substring(0, 5);
        }

        // Random 4-character suffix for uniqueness
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        return brandPrefix + "-" + namePart + "-" + randomSuffix;
    }

    /**
     * Generate an automatic SKU for a variant.
     * Format: [PARENT_SKU]-[ATTR_PART]-[RANDOM_SUFFIX]
     */
    public static String generateVariantSku(String parentSku, java.util.Map<String, Object> attributes) {
        StringBuilder attrPart = new StringBuilder();
        if (attributes != null && !attributes.isEmpty()) {
            attributes.values().forEach(val -> {
                String s = String.valueOf(val).toUpperCase().replaceAll("[^A-Z0-9]", "");
                if (s.length() > 3) s = s.substring(0, 3);
                if (!s.isEmpty()) {
                    if (attrPart.length() > 0) attrPart.append("-");
                    attrPart.append(s);
                }
            });
        }

        String randomSuffix = UUID.randomUUID().toString().substring(0, 3).toUpperCase();
        
        String result = parentSku;
        if (attrPart.length() > 0) {
            result += "-" + attrPart.toString();
        }
        return result + "-" + randomSuffix;
    }
}
