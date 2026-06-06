package com.example.OneNightProject.cart.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
public class CartItemRequest {
    private Long cartId;

    private Long productId;

    private Integer quantity;

    private String customText;

    private String customNote;

    private String customImage;
}
