package com.example.OneNightProject.seller.service;

import com.example.OneNightProject.seller.dto.DashboardResponse;

import java.util.List;

public interface SellerDashboardService {
    DashboardResponse getDashboard(String authHeader);
    List<DashboardResponse.RevenuePoint> getRevenue(String authHeader, String period);
}
