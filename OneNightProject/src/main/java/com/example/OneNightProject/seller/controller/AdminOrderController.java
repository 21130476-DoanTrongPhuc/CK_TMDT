package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.OrderListResponse;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.mapper.OrderMapper;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    private Users getAdmin(String authHeader) {
        String token = authHeader.substring(7);
        Users user = customerRepository.findByEmail(jwtService.extractUsername(token));
        if (user == null || user.getRole() != CustomerEnum.ADMIN) {
            return null;
        }
        return user;
    }

    /**
     * Lấy tất cả đơn hàng (phân trang) — chỉ đọc
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<OrderListResponse>> list(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderListResponse> result = orderRepository.findAll(pageable)
                .map(orderMapper::toListResponse);
        return ResponseEntity.ok(result);
    }

    /**
     * Chi tiết đơn hàng — chỉ đọc
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<OrderDetailResponse> getById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null || order.getDeletedAt() != null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orderMapper.toDetailResponse(order));
    }
}
