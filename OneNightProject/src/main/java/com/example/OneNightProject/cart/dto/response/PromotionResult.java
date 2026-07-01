package com.example.OneNightProject.cart.dto.response;

import com.example.OneNightProject.promotion.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PromotionResult {

    private Promotion promotion;

    // giá gốc
    private BigDecimal originalPrice;

    // giá sau giảm của 1 sản phẩm
    private BigDecimal finalPrice;

    // giảm bao nhiêu
    private BigDecimal discountAmount;
}
