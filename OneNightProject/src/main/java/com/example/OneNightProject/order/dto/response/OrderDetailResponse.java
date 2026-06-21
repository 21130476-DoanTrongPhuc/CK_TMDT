package com.example.OneNightProject.order.dto.response;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {

    private Long id;

    private String orderCode;

    private Long userId;

    private BigDecimal totalPrice;

    private BigDecimal paidAmount;

    private BigDecimal remainingAmount;

    private OrderStatus status;

    private PaymentStatusOrder paymentStatus;

    private String receiverName;

    private String receiverPhone;

    private String shippingAddress;

    private LocalDateTime createdAt;

    private List<OrderItemDetailResponse> items;

    private List<OrderStatusHistoryResponse> statusHistories;
}
