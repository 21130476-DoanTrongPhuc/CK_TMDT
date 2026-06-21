package com.example.OneNightProject.cart.controller;

import com.example.OneNightProject.cart.dto.request.CartItemRequest;
import com.example.OneNightProject.cart.dto.request.CartUpdateRequest;
import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/carts")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    /**
     * Tạo cart nếu chưa tồn tại
     */
    @PostMapping
    public ResponseEntity<CartResponse> createCart(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        return ResponseEntity.ok(
                cartService.createProduct(authHeader)
        );
    }

    /**
     * Lấy giỏ hàng hiện tại của user
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        return ResponseEntity.ok(
                cartService.getCartItem(authHeader)
        );
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addCartItem(
            @RequestHeader("Authorization")
            String authHeader,
            @RequestBody CartItemRequest request
    ) {

        return ResponseEntity.ok(
                cartService.addCartItem(
                        authHeader,
                        request
                )
        );
    }

    /**
     * Cập nhật số lượng sản phẩm
     */
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long cartItemId,
            @RequestBody CartUpdateRequest request
    ) {

        return ResponseEntity.ok(
                cartService.updateItem(
                        authHeader,
                        cartItemId,
                        request
                )
        );
    }

    /**
     * Xóa 1 sản phẩm khỏi giỏ hàng
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long cartItemId
    ) {

        return ResponseEntity.ok(
                cartService.removeItem(
                        authHeader,
                        cartItemId
                )
        );
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        cartService.clearCart(authHeader);

        return ResponseEntity.status(
                HttpStatus.NO_CONTENT
        ).build();
    }
}