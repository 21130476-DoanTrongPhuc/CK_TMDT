package com.example.OneNightProject.order.dto.response;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {

    private Long id;

    private String orderCode;

    private BigDecimal totalPrice;

    private Integer totalItems;

    private OrderStatus status;

    private PaymentStatusOrder paymentStatus;

    private String receiverName;

    private String receiverPhone;

    private LocalDateTime createdAt;
}
