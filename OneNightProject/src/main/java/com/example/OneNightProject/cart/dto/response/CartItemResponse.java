package com.example.OneNightProject.cart.dto.response;

import com.example.OneNightProject.product.dto.response.ProductResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;

    private Integer quantity;

    private Boolean customized;

    private BigDecimal priceCustomProduct;

    private BigDecimal itemTotal;

    private ProductResponse product;

    private String customText;

    private String customNote;

    private String customImage;
}
