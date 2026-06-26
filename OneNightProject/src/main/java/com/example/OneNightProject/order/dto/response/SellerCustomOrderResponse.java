package com.example.OneNightProject.order.dto.response;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SellerCustomOrderResponse {

    private Long orderId;

    private String orderCode;

    private String buyerName;

    private Integer customItems;

    private BigDecimal customAmount;

    private OrderStatus orderStatus;

    private PaymentStatusOrder paymentStatus;

    private LocalDateTime createdAt;
}
