package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.seller.dto.DashboardResponse;
import com.example.OneNightProject.seller.service.SellerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerDashboardController {

    private final SellerDashboardService sellerDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(sellerDashboardService.getDashboard(authHeader));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<DashboardResponse.RevenuePoint>> getRevenue(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "day") String period) {
        return ResponseEntity.ok(sellerDashboardService.getRevenue(authHeader, period));
    }
}
