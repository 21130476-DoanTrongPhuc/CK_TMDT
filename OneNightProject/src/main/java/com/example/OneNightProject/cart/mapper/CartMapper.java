package com.example.OneNightProject.cart.mapper;

import com.example.OneNightProject.cart.dto.response.CartItemCustomizationResponse;
import com.example.OneNightProject.cart.dto.response.CartItemResponse;
import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.entity.CartItemCustomization;
import com.example.OneNightProject.product.dto.response.ProductImageResponse;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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

    private CartItemResponse toItemResponse(CartItem item) {

        BigDecimal originalPrice =
                Optional.ofNullable(item.getOriginalPrice())
                        .orElse(BigDecimal.ZERO)
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        BigDecimal discountPrice =
                Optional.ofNullable(item.getUnitPrice())
                        .orElse(BigDecimal.ZERO)
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        BigDecimal discountAmount =
                Optional.ofNullable(item.getDiscountAmount())
                        .orElse(BigDecimal.ZERO)
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        BigDecimal customizationPrice =
                Optional.ofNullable(item.getPriceCustomProduct())
                        .orElse(BigDecimal.ZERO);

        BigDecimal itemTotal =
                Optional.ofNullable(item.getUnitPrice())
                        .orElse(BigDecimal.ZERO)
                        .add(customizationPrice)
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        return CartItemResponse.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .customized(item.isCustomized())
                .priceCustomProduct(customizationPrice)

                // Promotion Snapshot
                .originalPrice(originalPrice)
                .discountPrice(discountPrice)
                .discountAmount(discountAmount)
                .itemTotal(itemTotal)
                .promotionName(item.getPromotionName())

                .product(
                        toProductResponse(
                                item.getProduct()
                        )
                )

                .customizations(
                        mapCustomizations(
                                item.getCustomizations()
                        )
                )

                .build();
    }

    private List<CartItemCustomizationResponse> mapCustomizations(
            List<CartItemCustomization> customizations
    ) {

        if (customizations == null) {
            return Collections.emptyList();
        }

        return customizations.stream()
                .map(customization ->
                        CartItemCustomizationResponse.builder()

                                .fieldId(
                                        customization.getField().getId()
                                )

                                .fieldName(
                                        customization.getField().getName()
                                )

                                .optionId(
                                        customization.getOption() == null
                                                ? null
                                                : customization.getOption().getId()
                                )

                                .optionLabel(
                                        customization.getOption() == null
                                                ? null
                                                : customization.getOption().getLabel()
                                )

                                .textValue(
                                        customization.getTextValue()
                                )

                                .extraPrice(
                                        customization.getExtraPrice()
                                )

                                .build()
                )
                .toList();
    }

    private ProductResponse toProductResponse(Product product) {

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