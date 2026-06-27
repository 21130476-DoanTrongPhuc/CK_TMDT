package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.dto.response.OrderListResponse;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderStatusHistory;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.mapper.OrderMapper;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.order.repository.OrderStatusHistoryRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    private Users getSeller(String authHeader) {
        String token = authHeader.substring(7);
        return customerRepository.findByEmail(jwtService.extractUsername(token));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<OrderListResponse>> list(
            @RequestHeader("Authorization") String authHeader) {
        Users seller = getSeller(authHeader);
        List<OrderListResponse> orders = orderRepository.findAllBySellerId(seller.getId())
                .stream()
                .map(orderMapper::toListResponse)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Void> updateStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Users seller = getSeller(authHeader);

        if (!orderRepository.existsByIdAndSellerId(id, seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus = OrderStatus.valueOf(body.get("status"));
        String oldStatus = order.getStatus().name();

        order.setStatus(newStatus);
        orderRepository.save(order);

        orderStatusHistoryRepository.save(
                new OrderStatusHistory(order, oldStatus, newStatus.name())
        );

        return ResponseEntity.ok().build();
    }
}
