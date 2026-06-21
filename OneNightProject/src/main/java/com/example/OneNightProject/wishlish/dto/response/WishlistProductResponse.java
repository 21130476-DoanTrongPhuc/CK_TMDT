package com.example.OneNightProject.wishlish.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WishlistProductResponse {

    private Long productId;

    private String name;

    private BigDecimal price;

    private Integer stock;

    private String imageUrl;
}
