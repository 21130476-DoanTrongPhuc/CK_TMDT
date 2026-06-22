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
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalSellers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal revenueThisMonth;
    private long todayOrders;
    private long pendingApprovalProducts;
    private List<DashboardResponse.OrderStatusCount> orderStatusCounts;
    private List<DashboardResponse.RecentOrder> recentOrders;
    private List<DashboardResponse.TopProduct> topProducts;
    private List<DashboardResponse.RevenuePoint> revenueByDay;
}
