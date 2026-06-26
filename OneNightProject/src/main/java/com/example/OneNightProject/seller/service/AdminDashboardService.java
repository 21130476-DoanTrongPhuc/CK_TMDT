package com.example.OneNightProject.seller.service;

import com.example.OneNightProject.seller.dto.AdminDashboardResponse;
import com.example.OneNightProject.seller.dto.DashboardResponse;

import java.util.List;

public interface AdminDashboardService {
    AdminDashboardResponse getDashboard();
    List<DashboardResponse.RevenuePoint> getRevenue(String period);
}
