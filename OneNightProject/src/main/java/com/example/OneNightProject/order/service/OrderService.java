package com.example.OneNightProject.order.service;

import com.example.OneNightProject.order.dto.request.OrderFilterRequest;
import com.example.OneNightProject.order.dto.request.OrderRequest;
import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.OrderListResponse;
import com.example.OneNightProject.order.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

public interface OrderService {
    OrderResponse create(String authHeader, OrderRequest request);
    Page<OrderListResponse> getMyOrders(
            String authHeader,
            OrderFilterRequest request,
            Pageable pageable
    );

    Page<OrderListResponse> getSellerOrders(
            String authHeader,
            OrderFilterRequest request,
            Pageable pageable
    );

    OrderDetailResponse getOrderDetail(
            String authHeader,
            Long orderId
    );
}
