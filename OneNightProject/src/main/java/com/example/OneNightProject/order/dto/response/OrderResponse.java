package com.example.OneNightProject.order.dto.response;

import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    private Long userId;

    private String orderCode;

    private BigDecimal totalPrice;

    private List<OrderItemResponse> items;

    private String shippingAddress;

    private String receiverName;

    private String receiverPhone;

    private BigDecimal paidAmount;

    private BigDecimal remainingAmount;

    private PaymentStatusOrder paymentStatus;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
