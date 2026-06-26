package com.example.OneNightProject.payment.dto.response;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.payment.enums.PaymentMethod;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SellerPaymentResponse {

    private Long paymentId;

    private String paymentCode;

    private Long orderId;

    private String orderCode;

    private String buyerName;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private PaymentStatusOrder orderPaymentStatus;

    private OrderStatus orderStatus;

    private BigDecimal amount;

    private String transactionId;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;
}
