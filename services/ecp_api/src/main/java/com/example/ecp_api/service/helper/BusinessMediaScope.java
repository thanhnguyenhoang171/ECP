package com.example.ecp_api.service.helper;

import java.util.List;

/** Only folders owned by the catalog modules. Trailing slashes prevent prefix collisions. */
public final class BusinessMediaScope {
    private BusinessMediaScope() {}
    public static final List<String> PREFIXES = List.of(
            "ecp_uploads/products/", "ecp_uploads/categories/", "ecp_uploads/brands/"
    );
}
