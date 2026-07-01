package com.example.OneNightProject.cart.dto.response;

import com.example.OneNightProject.product.dto.response.ProductResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;

    private Integer quantity;

    private Boolean customized;

    private BigDecimal priceCustomProduct;

    // giá gốc
    private BigDecimal originalPrice;

    // giá sau giảm
    private BigDecimal discountPrice;

    // giảm bao nhiêu
    private BigDecimal discountAmount;

    // tổng của item
    private BigDecimal itemTotal;

    private String promotionName;

    private ProductResponse product;

    private String customText;

    private String customNote;

    private String customImage;

}
