package com.example.OneNightProject.order.controller;

import com.example.OneNightProject.order.dto.request.OrderFilterRequest;
import com.example.OneNightProject.order.dto.request.OrderRequest;
import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.OrderListResponse;
import com.example.OneNightProject.order.dto.response.OrderResponse;
import com.example.OneNightProject.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestHeader("Authorization") String authHeader, @RequestBody OrderRequest request){
        return ResponseEntity.ok(orderService.create(authHeader, request));
    }

    @PostMapping("/my-orders")
    public ResponseEntity<Page<OrderListResponse>>
    getMyOrders(
            @RequestHeader("Authorization")
            String authHeader,
            @RequestBody OrderFilterRequest request,
            Pageable pageable
    ){

        return ResponseEntity.ok(
                orderService.getMyOrders(
                        authHeader,
                        request,
                        pageable
                )
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse>
    getOrderDetail(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long orderId
    ){

        return ResponseEntity.ok(
                orderService.getOrderDetail(
                        authHeader,
                        orderId
                )
        );
    }
}
