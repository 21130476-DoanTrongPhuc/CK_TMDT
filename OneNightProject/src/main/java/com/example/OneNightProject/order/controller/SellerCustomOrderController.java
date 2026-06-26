package com.example.OneNightProject.order.controller;

import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.SellerCustomOrderResponse;
import com.example.OneNightProject.order.service.SellerCustomOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/seller/custom-orders")
public class SellerCustomOrderController {

    private final SellerCustomOrderService sellerCustomOrderService;

    @GetMapping
    public Page<SellerCustomOrderResponse> getMyCustomOrders(
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable
    ) {
        return sellerCustomOrderService.getMyCustomOrders(authHeader, pageable);
    }

    @GetMapping("/{orderId}")
    public OrderDetailResponse getDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId
    ) {
        return sellerCustomOrderService.getDetail(authHeader, orderId);
    }
}
