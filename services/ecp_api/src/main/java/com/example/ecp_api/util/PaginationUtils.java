package com.example.ecp_api.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class for common pagination and sorting logic.
 */
public class PaginationUtils {

    /**
     * Builds a defensive and stable Sort object.
     * Filters out invalid property names and ensures specific fields are always present at the end for stability.
     *
     * @param originalSort The sort object from the request.
     * @param stableOrders The mandatory orders to ensure stability (tie-breakers).
     * @return A new Sort object with filtered properties and mandatory tie-breakers.
     */
    public static Sort buildSort(Sort originalSort, Sort.Order... stableOrders) {
        List<Sort.Order> orders = new ArrayList<>();
        
        // Collect names of mandatory fields to avoid duplicates
        Set<String> stableProperties = Arrays.stream(stableOrders)
                .map(Sort.Order::getProperty)
                .collect(Collectors.toSet());

        if (originalSort.isSorted()) {
            for (Sort.Order order : originalSort) {
                // Defensive check: Only add if property name is not empty and not in the stable set
                if (StringUtils.hasText(order.getProperty()) && !stableProperties.contains(order.getProperty())) {
                    orders.add(order);
                }
            }
        }

        // Add mandatory stable tie-breakers
        orders.addAll(Arrays.asList(stableOrders));

        return Sort.by(orders);
    }

    /**
     * Creates a new Pageable with defensive and stable sorting based on an existing Pageable.
     *
     * @param pageable     The original Pageable from controller.
     * @param stableOrders The tie-breaker sort orders.
     * @return A new PageRequest instance with refined sorting.
     */
    public static Pageable applyStableSort(Pageable pageable, Sort.Order... stableOrders) {
        if (pageable == null) return null;
        Sort finalSort = buildSort(pageable.getSort(), stableOrders);
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), finalSort);
    }
}
