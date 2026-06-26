package com.example.OneNightProject.order.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.SellerCustomOrderResponse;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.mapper.OrderMapper;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.order.service.SellerCustomOrderService;
import com.example.OneNightProject.payment.entity.Payment;
import com.example.OneNightProject.payment.repository.PaymentRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerCustomOrderServiceImpl implements SellerCustomOrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;
    private final OrderMapper orderMapper;

    @Override
    public Page<SellerCustomOrderResponse> getMyCustomOrders(String authHeader, Pageable pageable) {
        Users seller = getCurrentSeller(authHeader);

        return orderRepository.findDistinctBySellerId(seller.getId(), pageable)
                .map(order -> toSummary(order, seller.getId()));
    }

    @Override
    public OrderDetailResponse getDetail(String authHeader, Long orderId) {
        Users seller = getCurrentSeller(authHeader);

        Order order = orderRepository.findSellerCustomOrderById(orderId, seller.getId())
                .orElseThrow(() -> new RuntimeException("Custom order not found"));

        return orderMapper.toDetailResponse(order);
    }

    private Users getCurrentSeller(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is invalid");
        }

        String token = authHeader.substring(7);
        Users user = customerRepository.findByEmail(jwtService.extractUsername(token));

        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (user.getRole() != CustomerEnum.SELLER) {
            throw new RuntimeException("Only seller can manage custom orders");
        }

        return user;
    }

    private SellerCustomOrderResponse toSummary(Order order, Long sellerId) {
        List<OrderItem> sellerCustomItems = order.getOrderItems() == null
                ? Collections.emptyList()
                : order.getOrderItems().stream()
                .filter(item -> item.getProductId() != null)
                .filter(item -> item.getProductId().getSeller() != null)
                .filter(item -> item.getProductId().getSeller().getId().equals(sellerId))
                .filter(OrderItem::isCustomized)
                .toList();

        BigDecimal customAmount = sellerCustomItems.stream()
                .map(this::calculateItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SellerCustomOrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .buyerName(order.getUser() == null ? null : order.getUser().getFullName())
                .customItems(sellerCustomItems.size())
                .customAmount(customAmount)
                .orderStatus(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private BigDecimal calculateItemTotal(OrderItem item) {
        int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        BigDecimal basePrice = item.getPrice() == null
                ? BigDecimal.ZERO
                : item.getPrice().multiply(BigDecimal.valueOf(quantity));

        if (item.isCustomized() &&
                item.getPriceCustomProduct() != null &&
                item.getPriceCustomProduct().compareTo(BigDecimal.ZERO) > 0) {
            return item.getPriceCustomProduct();
        }

        return basePrice;
    }
}
