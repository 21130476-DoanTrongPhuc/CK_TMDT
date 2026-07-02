package com.example.OneNightProject.cart.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
public class CartItemRequest {
    private Long cartId;

    private Long productId;

    private Integer quantity;

    private List<CartItemCustomizationRequest> customizations;
}
