package com.example.OneNightProject.promotion.dto.response;

import com.example.OneNightProject.promotion.enums.ApplyType;
import com.example.OneNightProject.promotion.enums.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PromotionResponse {

    private Long id;

    private Boolean active;

    private String code;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private LocalDateTime endDate;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minOrderValue;

    private String name;

    private LocalDateTime startDate;

    private Integer usageLimit;

    private Integer usedCount;

    private Long productId;

    private Long sellerId;

    private String sellerName;

    private String productName;

    private ApplyType applyType;
}
