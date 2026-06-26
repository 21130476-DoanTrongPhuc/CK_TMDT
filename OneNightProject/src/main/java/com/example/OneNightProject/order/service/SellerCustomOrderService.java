package com.example.OneNightProject.order.service;

import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.SellerCustomOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerCustomOrderService {

    Page<SellerCustomOrderResponse> getMyCustomOrders(String authHeader, Pageable pageable);

    OrderDetailResponse getDetail(String authHeader, Long orderId);
}
