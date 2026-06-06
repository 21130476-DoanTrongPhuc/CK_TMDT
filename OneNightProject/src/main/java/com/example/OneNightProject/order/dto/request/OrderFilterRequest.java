package com.example.OneNightProject.order.dto.request;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrderFilterRequest {

    private String orderCode;

    private OrderStatus status;

    private PaymentStatusOrder paymentStatus;

    private LocalDateTime fromDate;

    private LocalDateTime toDate;

}