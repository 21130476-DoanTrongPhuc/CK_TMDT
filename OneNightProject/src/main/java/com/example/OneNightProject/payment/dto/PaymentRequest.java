package com.example.OneNightProject.payment.dto;

import com.example.OneNightProject.payment.enums.PaymentMethod;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class PaymentRequest {
    private Long orderId;
    private PaymentMethod paymentMethod;
}
