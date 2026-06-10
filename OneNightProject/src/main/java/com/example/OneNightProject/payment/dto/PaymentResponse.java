package com.example.OneNightProject.payment.dto;

import com.example.OneNightProject.order.dto.response.OrderResponse;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.payment.enums.PaymentMethod;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import com.example.OneNightProject.payment.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@RequiredArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Boolean customized;
    private String transactionId;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private OrderStatus orderStatus;
    private PaymentStatusOrder orderPaymentStatus;
}
