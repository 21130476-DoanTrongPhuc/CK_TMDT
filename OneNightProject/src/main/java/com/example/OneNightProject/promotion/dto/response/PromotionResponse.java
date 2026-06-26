package com.example.OneNightProject.promotion.dto.response;

import com.example.OneNightProject.promotion.enums.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PromotionResponse {

    private Long id;

    private String name;

    private String code;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private Integer usedCount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean active;

    private Long sellerId;

    private String sellerName;

    private Long productId;

    private String productName;
}
