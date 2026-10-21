package com.example.ecp_api.service.impl;
import com.example.ecp_api.security.DataOwnership;

import com.example.ecp_api.dto.response.DashboardOverviewResponse;
import com.example.ecp_api.entity.jpa.Inventory;
import com.example.ecp_api.entity.jpa.PurchaseOrder;
import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import com.example.ecp_api.repository.jpa.InventoryRepository;
import com.example.ecp_api.repository.jpa.PurchaseOrderRepository;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final org.springframework.data.mongodb.core.MongoTemplate ownershipMongo;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    private static final DecimalFormat VND_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.GERMANY);
        symbols.setGroupingSeparator('.');
        VND_FORMAT = new DecimalFormat("#,##0", symbols);
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 đ";
        synchronized (VND_FORMAT) { return VND_FORMAT.format(amount.setScale(0, RoundingMode.HALF_UP).longValue()) + " đ"; }
    }

    private BigDecimal calculateOrderAmount(PurchaseOrder po) {
        if (po.getItems() == null || po.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return po.getItems().stream()
                .filter(it -> it.getUnitPrice() != null && it.getOrderQuantity() != null)
                .map(it -> it.getUnitPrice().multiply(BigDecimal.valueOf(it.getOrderQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String extractInitials(String name) {
        if (!StringUtils.hasText(name)) return "SP";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardOverviewResponse getOverview(String period) {
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll(DataOwnership.orders(ownershipMongo), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

        List<PurchaseOrder> validOrders = allOrders.stream()
                .filter(po -> po.getStatus() != PurchaseOrderStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = validOrders.stream()
                .map(this::calculateOrderAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long newOrdersCount = allOrders.size();
        long newCustomersCount = DataOwnership.restricted() ? userRepository.count((root, query, cb) -> cb.and(cb.isNull(root.get("deletedAt")),
                cb.equal(root.join("createdBy", jakarta.persistence.criteria.JoinType.LEFT).get("email"), com.example.ecp_api.util.SecurityUtils.getCurrentUserEmail())))
                : userRepository.count((root, query, cb) -> cb.isNull(root.get("deletedAt")));
        long lowStockCount = inventoryRepository.count(DataOwnership.<Inventory>stock(ownershipMongo).and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("quantityOnHand"), 5)));

        DashboardOverviewResponse.DashboardStats stats = DashboardOverviewResponse.DashboardStats.builder()
                .totalRevenue(totalRevenue)
                .totalRevenueFormatted(formatVnd(totalRevenue))
                .totalRevenueTrend(totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? "up" : "neutral")
                .totalRevenueDescription(totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? "Tổng giá trị đơn nhập hàng" : "Chưa có biến động")
                .newOrdersCount(newOrdersCount)
                .newOrdersFormatted(String.valueOf(newOrdersCount))
                .newOrdersTrend(newOrdersCount > 0 ? "up" : "neutral")
                .newOrdersDescription(newOrdersCount > 0 ? (newOrdersCount + " đơn hàng đã tạo") : "Chưa có đơn hàng")
                .newCustomersCount(newCustomersCount)
                .newCustomersFormatted(String.valueOf(newCustomersCount))
                .newCustomersTrend(newCustomersCount > 0 ? "up" : "neutral")
                .newCustomersDescription(DataOwnership.restricted() ? "Tài khoản do bạn tạo" : "Tổng người dùng hệ thống")
                .lowStockCount(lowStockCount)
                .lowStockFormatted(String.valueOf(lowStockCount))
                .lowStockTrend(lowStockCount > 0 ? "down" : "neutral")
                .lowStockDescription(lowStockCount > 0 ? (lowStockCount + " SKU cần nhập thêm") : "Tồn kho an toàn")
                .build();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm - dd/MM");
        List<DashboardOverviewResponse.DashboardRecentOrder> recentOrders = allOrders.stream()
                .limit(10)
                .map(po -> {
                    BigDecimal amount = calculateOrderAmount(po);
                    String customer = po.getSupplier() != null && DataOwnership.visible(po.getSupplier().getCreatedBy()) ? po.getSupplier().getName()
                            : (StringUtils.hasText(po.getCreatedBy()) ? po.getCreatedBy() : "Hệ thống");
                    return DashboardOverviewResponse.DashboardRecentOrder.builder()
                            .id(po.getId().toString())
                            .orderCode(po.getPoCode())
                            .customer(customer)
                            .amount(amount)
                            .amountFormatted(formatVnd(amount))
                            .status(po.getStatus() != null ? po.getStatus().name() : "PENDING")
                            .date(po.getCreatedAt())
                            .dateFormatted(po.getCreatedAt() != null ? po.getCreatedAt().format(dtf) : "Gần đây")
                            .build();
                })
                .collect(Collectors.toList());

        var ownedProductIds = DataOwnership.restricted() ? new java.util.HashSet<>(DataOwnership.productIds(ownershipMongo)) : java.util.Set.<String>of();
        Map<String, ProductAggregation> productMap = new LinkedHashMap<>();
        for (PurchaseOrder po : validOrders) {
            if (po.getItems() != null) {
                for (PurchaseOrderItem item : po.getItems()) {
                    if (item.getSku() != null && (!DataOwnership.restricted() || ownedProductIds.contains(item.getSku().getProductId()))) {
                        String skuId = item.getSku().getId().toString();
                        String name = StringUtils.hasText(item.getSku().getProductName())
                                ? item.getSku().getProductName()
                                : item.getSku().getSkuCode();
                        int qty = item.getOrderQuantity() != null ? item.getOrderQuantity() : 0;
                        BigDecimal rev = (item.getUnitPrice() != null && qty > 0)
                                ? item.getUnitPrice().multiply(BigDecimal.valueOf(qty))
                                : BigDecimal.ZERO;

                        productMap.compute(skuId, (k, existing) -> {
                            if (existing == null) {
                                return new ProductAggregation(skuId, name, qty, rev);
                            }
                            existing.sales += qty;
                            existing.revenue = existing.revenue.add(rev);
                            return existing;
                        });
                    }
                }
            }
        }

        List<DashboardOverviewResponse.DashboardTopProduct> topProducts;
        if (!productMap.isEmpty()) {
            topProducts = productMap.values().stream()
                    .sorted((a, b) -> Integer.compare(b.sales, a.sales))
                    .limit(5)
                    .map(p -> DashboardOverviewResponse.DashboardTopProduct.builder()
                            .id(p.id)
                            .name(p.name)
                            .sales(p.sales)
                            .revenue(p.revenue)
                            .revenueFormatted(formatVnd(p.revenue))
                            .initials(extractInitials(p.name))
                            .build())
                    .collect(Collectors.toList());
        } else {
            List<Inventory> topInventory = inventoryRepository.findAll(DataOwnership.stock(ownershipMongo), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "quantityOnHand"));
            topProducts = topInventory.stream()
                    .limit(5)
                    .map(inv -> {
                        String name = inv.getSku() != null && StringUtils.hasText(inv.getSku().getProductName())
                                ? inv.getSku().getProductName()
                                : (inv.getSku() != null ? inv.getSku().getSkuCode() : "Sản phẩm");
                        int sales = inv.getQuantityOnHand() != null ? inv.getQuantityOnHand() : 0;
                        return DashboardOverviewResponse.DashboardTopProduct.builder()
                                .id(inv.getId().toString())
                                .name(name)
                                .sales(sales)
                                .revenue(BigDecimal.ZERO)
                                .revenueFormatted("0 đ")
                                .initials(extractInitials(name))
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        List<DashboardOverviewResponse.DashboardChartPoint> chartData = buildChartData(period, validOrders);

        return DashboardOverviewResponse.builder()
                .stats(stats)
                .recentOrders(recentOrders)
                .topProducts(topProducts)
                .chartData(chartData)
                .build();
    }

    private List<DashboardOverviewResponse.DashboardChartPoint> buildChartData(String period, List<PurchaseOrder> validOrders) {
        String p = StringUtils.hasText(period) ? period.toLowerCase().trim() : "12m";

        if ("7d".equals(p)) {
            LocalDate today = LocalDate.now();
            List<DashboardOverviewResponse.DashboardChartPoint> points = new ArrayList<>();
            DateTimeFormatter labelFormat = DateTimeFormatter.ofPattern("dd/MM");

            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                BigDecimal dayRevenue = BigDecimal.ZERO;

                for (PurchaseOrder po : validOrders) {
                    if (po.getCreatedAt() != null && po.getCreatedAt().toLocalDate().isEqual(date)) {
                        dayRevenue = dayRevenue.add(calculateOrderAmount(po));
                    }
                }
                BigDecimal dayProfit = dayRevenue.multiply(new BigDecimal("0.25"));
                points.add(DashboardOverviewResponse.DashboardChartPoint.builder()
                        .label(date.format(labelFormat))
                        .revenue(dayRevenue)
                        .profit(dayProfit)
                        .build());
            }
            return points;
        }

        if ("30d".equals(p)) {
            LocalDate today = LocalDate.now();
            List<DashboardOverviewResponse.DashboardChartPoint> points = new ArrayList<>();
            DateTimeFormatter labelFormat = DateTimeFormatter.ofPattern("dd/MM");

            for (int i = 29; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                BigDecimal dayRevenue = BigDecimal.ZERO;

                for (PurchaseOrder po : validOrders) {
                    if (po.getCreatedAt() != null && po.getCreatedAt().toLocalDate().isEqual(date)) {
                        dayRevenue = dayRevenue.add(calculateOrderAmount(po));
                    }
                }
                BigDecimal dayProfit = dayRevenue.multiply(new BigDecimal("0.25"));
                points.add(DashboardOverviewResponse.DashboardChartPoint.builder()
                        .label(date.format(labelFormat))
                        .revenue(dayRevenue)
                        .profit(dayProfit)
                        .build());
            }
            return points;
        }

        // Default: "12m"
        int currentYear = LocalDate.now().getYear();
        List<DashboardOverviewResponse.DashboardChartPoint> points = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            final int m = month;
            BigDecimal monthRevenue = BigDecimal.ZERO;

            for (PurchaseOrder po : validOrders) {
                if (po.getCreatedAt() != null
                        && po.getCreatedAt().getYear() == currentYear
                        && po.getCreatedAt().getMonthValue() == m) {
                    monthRevenue = monthRevenue.add(calculateOrderAmount(po));
                }
            }
            BigDecimal monthProfit = monthRevenue.multiply(new BigDecimal("0.25"));
            points.add(DashboardOverviewResponse.DashboardChartPoint.builder()
                    .label("Th" + m)
                    .revenue(monthRevenue)
                    .profit(monthProfit)
                    .build());
        }
        return points;
    }

    private static class ProductAggregation {
        String id;
        String name;
        int sales;
        BigDecimal revenue;

        ProductAggregation(String id, String name, int sales, BigDecimal revenue) {
            this.id = id;
            this.name = name;
            this.sales = sales;
            this.revenue = revenue;
        }
    }
}
