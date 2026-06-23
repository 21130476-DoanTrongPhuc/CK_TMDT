package com.example.OneNightProject.payment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SellerPaymentSummaryResponse {

    private long totalPayments;

    private long paidPayments;

    private long pendingPayments;

    private long failedPayments;

    private long refundedPayments;

    private long totalOrders;

    private BigDecimal totalRevenue;
}
