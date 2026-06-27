package com.example.OneNightProject.seller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal revenueThisMonth;
    private long totalOrders;
    private long todayOrders;
    private long totalProducts;
    private long totalReviews;
    private long newReviews;
    private List<OrderStatusCount> orderStatusCounts;
    private List<RecentOrder> recentOrders;
    private List<TopProduct> topProducts;
    private List<RevenuePoint> revenueByDay;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderStatusCount {
        private String status;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentOrder {
        private String orderCode;
        private String buyerName;
        private BigDecimal totalPrice;
        private String status;
        private String paymentStatus;
        private String createdAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProduct {
        private String productName;
        private long totalQuantity;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenuePoint {
        private String date;
        private BigDecimal revenue;
    }
}