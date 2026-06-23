package com.example.OneNightProject.payment.service;

import com.example.OneNightProject.payment.dto.response.SellerPaymentResponse;
import com.example.OneNightProject.payment.dto.response.SellerPaymentSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerPaymentService {

    Page<SellerPaymentResponse> getMyPayments(String authHeader, Pageable pageable);

    SellerPaymentSummaryResponse getSummary(String authHeader);
}
