package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private DashboardStats stats;
    private List<DashboardRecentOrder> recentOrders;
    private List<DashboardTopProduct> topProducts;
    private List<DashboardChartPoint> chartData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private BigDecimal totalRevenue;
        private String totalRevenueFormatted;
        private String totalRevenueTrend;
        private String totalRevenueDescription;

        private long newOrdersCount;
        private String newOrdersFormatted;
        private String newOrdersTrend;
        private String newOrdersDescription;

        private long newCustomersCount;
        private String newCustomersFormatted;
        private String newCustomersTrend;
        private String newCustomersDescription;

        private long lowStockCount;
        private String lowStockFormatted;
        private String lowStockTrend;
        private String lowStockDescription;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardRecentOrder {
        private String id;
        private String orderCode;
        private String customer;
        private BigDecimal amount;
        private String amountFormatted;
        private String status;
        private LocalDateTime date;
        private String dateFormatted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardTopProduct {
        private String id;
        private String name;
        private int sales;
        private BigDecimal revenue;
        private String revenueFormatted;
        private String initials;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardChartPoint {
        private String label;
        private BigDecimal revenue;
        private BigDecimal profit;
    }
}
