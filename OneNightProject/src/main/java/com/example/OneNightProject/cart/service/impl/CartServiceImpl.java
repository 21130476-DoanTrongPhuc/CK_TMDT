package com.example.OneNightProject.cart.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.cart.dto.request.CartItemRequest;
import com.example.OneNightProject.cart.dto.request.CartUpdateRequest;
import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.entity.CartItemCustomized;
import com.example.OneNightProject.cart.mapper.CartMapper;
import com.example.OneNightProject.cart.repository.CartItemRepository;
import com.example.OneNightProject.cart.repository.CartRepository;
import com.example.OneNightProject.cart.service.CartService;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;

    private final CartItemRepository cartItemRepository;

    private final ProductRepository productRepository;

    private final CartMapper cartMapper;

    private final JwtService jwtService;

    private final CustomerRepository customerRepository;

    @Override
    public CartResponse createProduct(String authHeader) {

        Users user = getCurrentUser(authHeader);

        Cart cart = cartRepository.findByUserId(user.getId())
                        .orElseGet(() -> {
                            Cart newCart = Cart.builder()
                                    .user(user)
                                    .build();
                            return cartRepository.save(newCart);
                        });

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse addCartItem(
            String authHeader,
            CartItemRequest request
    ) {

        Users user = getCurrentUser(authHeader);

        Cart cart = getOrCreateCart(user);

        Product product =
                productRepository.findById(
                        request.getProductId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Product not found"
                        )
                );

        if (product.getStatus() != null &&
                product.getStatus().name().equals("DISCONTINUED")) {

            throw new RuntimeException(
                    "Product is unavailable"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        if (request.getQuantity() > product.getStock()) {

            throw new RuntimeException(
                    "Not enough stock"
            );
        }

        boolean isCustomized =
                hasText(request.getCustomText())
                        || hasText(request.getCustomNote())
                        || hasText(request.getCustomImage());

        /*
         * CUSTOM PRODUCT
         */
        if (isCustomized) {

            CartItem cartItem =
                    new CartItem();

            cartItem.setCart(cart);

            cartItem.setProduct(product);

            cartItem.setQuantity(
                    request.getQuantity()
            );

            cartItem.setCustomized(true);

            cartItem.setPriceCustomProduct(
                    BigDecimal.ZERO
            );

            CartItemCustomized customized =
                    CartItemCustomized.builder()
                            .cartItem(cartItem)
                            .custom_text(
                                    request.getCustomText()
                            )
                            .custom_note(
                                    request.getCustomNote()
                            )
                            .custom_image(
                                    request.getCustomImage()
                            )
                            .build();

            cartItem.setCustomization(
                    customized
            );

            cart.addCartItem(cartItem);

            cartItemRepository.save(cartItem);

            return cartMapper.toResponse(cart);
        }

        /*
         * NORMAL PRODUCT
         */
        Optional<CartItem> existingItem =
                cart.getCartItems()
                        .stream()
                        .filter(item ->
                                !item.isCustomized()
                                        && item.getProduct()
                                        .getId()
                                        .equals(
                                                product.getId()
                                        )
                        )
                        .findFirst();

        if (existingItem.isPresent()) {

            CartItem item =
                    existingItem.get();

            int newQuantity =
                    item.getQuantity()
                            + request.getQuantity();

            if (newQuantity > product.getStock()) {

                throw new RuntimeException(
                        "Not enough stock"
                );
            }

            item.setQuantity(
                    newQuantity
            );

            cartItemRepository.save(item);

        } else {

            CartItem cartItem =
                    new CartItem();

            cartItem.setCart(cart);

            cartItem.setProduct(product);

            cartItem.setQuantity(
                    request.getQuantity()
            );

            cartItem.setCustomized(false);

            cartItem.setPriceCustomProduct(
                    BigDecimal.ZERO
            );

            cart.addCartItem(cartItem);

            cartItemRepository.save(cartItem);
        }

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse removeItem(
            String authHeader,
            Long cartItemId
    ) {

        Users user =
                getCurrentUser(authHeader);

        Cart cart =
                getCartByUser(user);

        CartItem item =
                cart.getCartItems()
                        .stream()
                        .filter(ci ->
                                ci.getId()
                                        .equals(cartItemId)
                        )
                        .findFirst()
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Cart item not found"
                                )
                        );

        cart.removeCartItem(item);

        cartItemRepository.delete(item);

        cartRepository.save(cart);

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse updateItem(
            String authHeader,
            Long cartItemId,
            CartUpdateRequest update
    ) {

        Users user =
                getCurrentUser(authHeader);

        Cart cart =
                getCartByUser(user);

        CartItem item =
                cart.getCartItems()
                        .stream()
                        .filter(ci ->
                                ci.getId()
                                        .equals(cartItemId)
                        )
                        .findFirst()
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Cart item not found"
                                )
                        );

        if (update.getQuantity() == null ||
                update.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        if (update.getQuantity()
                > item.getProduct().getStock()) {

            throw new RuntimeException(
                    "Not enough stock"
            );
        }

        item.setQuantity(
                update.getQuantity()
        );

        cartItemRepository.save(item);

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse getCartItem(
            String authHeader
    ) {

        Users user =
                getCurrentUser(authHeader);

        Cart cart =
                getOrCreateCart(user);

        return cartMapper.toResponse(cart);
    }

    @Override
    public void clearCart(
            String authHeader
    ) {

        Users user =
                getCurrentUser(authHeader);

        Cart cart =
                getCartByUser(user);

        cart.getCartItems().clear();

        cartRepository.save(cart);
    }

    // =====================================================
    // PRIVATE METHODS
    // =====================================================

    private Users getCurrentUser(
            String authHeader
    ) {

        String token =
                authHeader.substring(7);

        String email =
                jwtService.extractUsername(token);

        return customerRepository
                .findByEmail(email);
    }

    private Cart getCartByUser(
            Users user
    ) {

        return cartRepository
                .findByUserId(user.getId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Cart not found"
                        )
                );
    }

    private Cart getOrCreateCart(
            Users user
    ) {

        return cartRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart cart =
                            Cart.builder()
                                    .user(user)
                                    .build();

                    return cartRepository
                            .save(cart);
                });
    }

    private boolean hasText(
            String value
    ) {

        return value != null
                && !value.trim().isEmpty();
    }
}