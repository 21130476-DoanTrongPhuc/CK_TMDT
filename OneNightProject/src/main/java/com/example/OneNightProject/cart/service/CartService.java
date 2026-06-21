package com.example.OneNightProject.cart.service;

import com.example.OneNightProject.cart.dto.request.CartItemRequest;
import com.example.OneNightProject.cart.dto.request.CartRequest;
import com.example.OneNightProject.cart.dto.request.CartUpdateRequest;
import com.example.OneNightProject.cart.dto.response.CartResponse;

public interface CartService {

    CartResponse createProduct(String authHeader);

    CartResponse addCartItem(
            String authHeader,
            CartItemRequest request
    );

    CartResponse removeItem(
            String authHeader,
            Long cartItemId
    );

    CartResponse updateItem(
            String authHeader,
            Long cartItemId,
            CartUpdateRequest update
    );

    CartResponse getCartItem(
            String authHeader
    );

    void clearCart(
            String authHeader
    );
}
