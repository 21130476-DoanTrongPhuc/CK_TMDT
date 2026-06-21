package com.example.OneNightProject.cart.mapper;

import com.example.OneNightProject.cart.dto.request.CartItemRequest;
import com.example.OneNightProject.cart.dto.request.CartRequest;
import com.example.OneNightProject.cart.dto.response.CartItemResponse;
import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductImageResponse;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {

        if (cart == null) {
            return null;
        }

        List<CartItemResponse> items =
                cart.getCartItems() == null
                        ? Collections.emptyList()
                        : cart.getCartItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList();

        BigDecimal totalPrice =
                items.stream()
                        .map(CartItemResponse::getItemTotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .totalItems(items.size())
                .totalPrice(totalPrice)
                .cartItems(items)
                .build();
    }

    private CartItemResponse toItemResponse(
            CartItem item
    ) {

        BigDecimal itemTotal =
                item.getProduct().getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        if (Boolean.TRUE.equals(item.isCustomized())) {
            itemTotal =
                    itemTotal.add(
                            item.getPriceCustomProduct()
                    );
        }

        String customText = null;
        String customNote = null;
        String customImage = null;

        if (item.getCustomization() != null) {

            customText =
                    item.getCustomization()
                            .getCustom_text();

            customNote =
                    item.getCustomization()
                            .getCustom_note();

            customImage =
                    item.getCustomization()
                            .getCustom_image();
        }

        return CartItemResponse.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .customized(item.isCustomized())
                .priceCustomProduct(
                        item.getPriceCustomProduct()
                )
                .itemTotal(itemTotal)
                .product(toProductResponse(
                        item.getProduct()
                ))
                .customText(customText)
                .customNote(customNote)
                .customImage(customImage)
                .build();
    }

    private ProductResponse toProductResponse(
            Product product
    ) {

        List<ProductImageResponse> images =
                product.getImages() == null
                        ? Collections.emptyList()
                        : product.getImages()
                        .stream()
                        .map(img ->
                                new ProductImageResponse(
                                        img.getId(),
                                        img.getImageUrl()
                                )
                        )
                        .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .status(product.getStatus())
                .images(images)
                .build();
    }
}