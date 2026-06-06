package com.example.OneNightProject.cart.dto.response;

import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.product.entity.Product;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;

    private Long userId;

    private Integer totalItems;

    private BigDecimal totalPrice;

    private List<CartItemResponse> cartItems;
}
