package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.seller.dto.AdminDashboardResponse;
import com.example.OneNightProject.seller.dto.DashboardResponse;
import com.example.OneNightProject.seller.service.AdminDashboardService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final AdminDashboardService adminDashboardService;

    private Users getAdmin(String authHeader) {
        String token = authHeader.substring(7);
        Users user = customerRepository.findByEmail(jwtService.extractUsername(token));
        if (user == null || user.getRole() != CustomerEnum.ADMIN) {
            return null;
        }
        return user;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard(
            @RequestHeader("Authorization") String authHeader) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminDashboardService.getDashboard());
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<DashboardResponse.RevenuePoint>> getRevenue(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "day") String period) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminDashboardService.getRevenue(period));
    }
}
