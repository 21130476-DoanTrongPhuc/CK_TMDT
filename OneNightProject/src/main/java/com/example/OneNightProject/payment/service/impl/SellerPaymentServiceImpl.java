package com.example.OneNightProject.payment.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.payment.dto.response.SellerPaymentResponse;
import com.example.OneNightProject.payment.dto.response.SellerPaymentSummaryResponse;
import com.example.OneNightProject.payment.entity.Payment;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import com.example.OneNightProject.payment.repository.PaymentRepository;
import com.example.OneNightProject.payment.service.SellerPaymentService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerPaymentServiceImpl implements SellerPaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;

    @Override
    public Page<SellerPaymentResponse> getMyPayments(String authHeader, Pageable pageable) {
        Users seller = getCurrentSeller(authHeader);

        return orderRepository.findDistinctBySellerId(seller.getId(), pageable)
                .map(order -> toResponse(order, paymentOfOrder(order)));
    }

    @Override
    public SellerPaymentSummaryResponse getSummary(String authHeader) {
        Users seller = getCurrentSeller(authHeader);
        var orders = orderRepository.findDistinctBySellerId(seller.getId());

        long totalPayments = orders.size();
        long paidPayments = 0;
        long pendingPayments = 0;
        long failedPayments = 0;
        long refundedPayments = 0;
        Set<Long> orderIds = new HashSet<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Order order : orders) {
            orderIds.add(order.getId());
            Payment payment = paymentOfOrder(order);
            if (payment == null) {
                pendingPayments++;
                continue;
            }

            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                paidPayments++;
                if (payment.getAmount() != null) {
                    totalRevenue = totalRevenue.add(payment.getAmount());
                }
            } else if (payment.getStatus() == PaymentStatus.PENDING) {
                pendingPayments++;
            } else if (payment.getStatus() == PaymentStatus.FAIL) {
                failedPayments++;
            } else if (payment.getStatus() == PaymentStatus.REFUNDED || payment.getStatus() == PaymentStatus.PARTIAL_REFUND) {
                refundedPayments++;
            }
        }

        return SellerPaymentSummaryResponse.builder()
                .totalPayments(totalPayments)
                .paidPayments(paidPayments)
                .pendingPayments(pendingPayments)
                .failedPayments(failedPayments)
                .refundedPayments(refundedPayments)
                .totalOrders(orderIds.size())
                .totalRevenue(totalRevenue)
                .build();
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
            throw new RuntimeException("Only seller can manage payments");
        }

        return user;
    }

    private Payment paymentOfOrder(Order order) {
        return paymentRepository.findByOrder(order.getId());
    }

    private SellerPaymentResponse toResponse(Order order, Payment payment) {
        var user = order != null ? order.getUser() : null;

        return SellerPaymentResponse.builder()
                .paymentId(payment == null ? null : payment.getId())
                .paymentCode(payment == null ? null : payment.getPaymentCode())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .buyerName(user == null ? null : user.getFullName())
                .paymentMethod(payment == null ? null : payment.getMethod())
                .paymentStatus(payment == null ? PaymentStatus.PENDING : payment.getStatus())
                .orderPaymentStatus(order.getPaymentStatus())
                .orderStatus(order.getStatus())
                .amount(payment != null && payment.getAmount() != null ? payment.getAmount() : order.getTotalPrice())
                .transactionId(payment == null ? null : payment.getTransactionId())
                .createdAt(payment != null ? payment.getCreatedAt() : order.getCreatedAt())
                .paidAt(payment == null ? null : payment.getPaidAt())
                .build();
    }
}
