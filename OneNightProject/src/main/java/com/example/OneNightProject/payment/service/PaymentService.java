package com.example.OneNightProject.payment.service;

import com.example.OneNightProject.payment.dto.PaymentDTO;
import com.example.OneNightProject.payment.dto.PaymentRequest;
import com.example.OneNightProject.payment.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(
            PaymentRequest request
    );

    PaymentResponse getPayment(
            Long orderId
    );

    List<PaymentResponse> getPaymentHistory(
            Long orderId
    );

    PaymentResponse confirmCOD(
            Long orderId
    );

    PaymentResponse completeCODPayment(
            Long orderId
    );

    PaymentResponse createRemainingPayment(
            Long orderId
    );

    PaymentDTO.VNPayResponse createVnPayPayment(
            HttpServletRequest request
    );

    void callBackHandler(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;
}