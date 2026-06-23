package com.example.OneNightProject.payment.controller;

import com.example.OneNightProject.payment.dto.response.SellerPaymentResponse;
import com.example.OneNightProject.payment.dto.response.SellerPaymentSummaryResponse;
import com.example.OneNightProject.payment.service.SellerPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/seller/payments")
public class SellerPaymentController {

    private final SellerPaymentService sellerPaymentService;

    @GetMapping
    public Page<SellerPaymentResponse> getMyPayments(
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable
    ) {
        return sellerPaymentService.getMyPayments(authHeader, pageable);
    }

    @GetMapping("/summary")
    public SellerPaymentSummaryResponse getSummary(
            @RequestHeader("Authorization") String authHeader
    ) {
        return sellerPaymentService.getSummary(authHeader);
    }
}
