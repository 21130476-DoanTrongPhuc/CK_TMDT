package com.example.OneNightProject.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDetailResponse {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private Boolean customized;

    private BigDecimal customizationPrice;

    private String customText;

    private String customNote;

    private String customImage;

    private BigDecimal originalPrice;

    private BigDecimal discountPrice;

    private BigDecimal discountAmount;

    private String promotionName;
}
