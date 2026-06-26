package com.example.OneNightProject.promotion.dto.request;

import com.example.OneNightProject.promotion.enums.DiscountType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {

    private String name;

    private String code;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean active;

    private Long productId;
}
