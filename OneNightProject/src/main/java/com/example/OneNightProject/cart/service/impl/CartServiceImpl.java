package com.example.OneNightProject.cart.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.cart.dto.request.CartItemCustomizationRequest;
import com.example.OneNightProject.cart.dto.request.CartItemRequest;
import com.example.OneNightProject.cart.dto.request.CartUpdateRequest;
import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.dto.response.PromotionResult;
import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.entity.CartItemCustomization;
import com.example.OneNightProject.cart.mapper.CartMapper;
import com.example.OneNightProject.cart.repository.CartItemCustomizationRepository;
import com.example.OneNightProject.cart.repository.CartItemRepository;
import com.example.OneNightProject.cart.repository.CartRepository;
import com.example.OneNightProject.cart.service.CartService;
import com.example.OneNightProject.cart.service.PromotionCalculatorService;
import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.enums.CustomFieldType;
import com.example.OneNightProject.product.repository.CustomFieldOptionRepository;
import com.example.OneNightProject.product.repository.CustomFieldRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.promotion.entity.Promotion;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.flywaydb.core.internal.util.StringUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CustomFieldRepository customFieldRepository;

    private final CustomFieldOptionRepository optionRepository;

    private final CartItemCustomizationRepository customizationRepository;

    private final CartRepository cartRepository;

    private final CartItemRepository cartItemRepository;

    private final ProductRepository productRepository;

    private final CartMapper cartMapper;

    private final JwtService jwtService;

    private final CustomerRepository customerRepository;

    private final PromotionCalculatorService promotionCalculatorService;

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

        PromotionResult promotionResult =
                promotionCalculatorService.calculate(product);

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
                request.getCustomizations() != null
                        && !request.getCustomizations().isEmpty();

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

            cartItem.setOriginalPrice(
                    promotionResult.getOriginalPrice()
            );

            cartItem.setUnitPrice(
                    promotionResult.getFinalPrice()
            );

            cartItem.setDiscountAmount(
                    promotionResult.getDiscountAmount()
            );

            if (promotionResult.getPromotion() != null) {

                cartItem.setPromotionId(
                        promotionResult.getPromotion().getId()
                );

                cartItem.setPromotionName(
                        promotionResult.getPromotion().getName()
                );

            }

            cartItemRepository.save(cartItem);

            BigDecimal customPrice =
                    buildCustomization(
                            cartItem,
                            product,
                            request.getCustomizations()
                    );

            cartItem.setPriceCustomProduct(
                    customPrice
            );

            cartItem.setUnitPrice(
                    promotionResult
                            .getFinalPrice()
                            .add(customPrice)
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

            item.setOriginalPrice(
                    promotionResult.getOriginalPrice()
            );

            item.setUnitPrice(
                    promotionResult.getFinalPrice()
            );

            item.setDiscountAmount(
                    promotionResult.getDiscountAmount()
            );

            if (promotionResult.getPromotion() != null) {

                item.setPromotionId(
                        promotionResult.getPromotion().getId()
                );

                item.setPromotionName(
                        promotionResult.getPromotion().getName()
                );

            } else {

                item.setPromotionId(null);

                item.setPromotionName(null);

            }

            cartItemRepository.save(item);

        } else {

            CartItem cartItem =
                    new CartItem();

            cartItem.setCart(cart);

            cartItem.setPriceCustomProduct(
                    BigDecimal.ZERO
            );

            cartItem.setProduct(product);

            cartItem.setQuantity(
                    request.getQuantity()
            );

            cartItem.setCustomized(false);

            cartItem.setOriginalPrice(
                    promotionResult.getOriginalPrice()
            );

            cartItem.setUnitPrice(
                    promotionResult.getFinalPrice()
            );

            cartItem.setDiscountAmount(
                    promotionResult.getDiscountAmount()
            );

            if (promotionResult.getPromotion() != null) {

                cartItem.setPromotionId(
                        promotionResult.getPromotion().getId()
                );

                cartItem.setPromotionName(
                        promotionResult.getPromotion().getName()
                );

            }

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

        PromotionResult promotionResult =
                promotionCalculatorService.calculate(
                        item.getProduct()
                );

        item.setOriginalPrice(
                promotionResult.getOriginalPrice()
        );

        item.setUnitPrice(
                promotionResult.getFinalPrice()
        );

        item.setDiscountAmount(
                promotionResult.getDiscountAmount()
        );

        if (promotionResult.getPromotion() != null) {

            item.setPromotionId(
                    promotionResult.getPromotion().getId()
            );

            item.setPromotionName(
                    promotionResult.getPromotion().getName()
            );

        } else {

            item.setPromotionId(null);

            item.setPromotionName(null);

        }

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

    private CustomField getField(
            Product product,
            Long fieldId
    ) {

        return customFieldRepository

                .findById(fieldId)

                .filter(field ->
                        field.getProduct()
                                .getId()
                                .equals(product.getId())
                )

                .orElseThrow(() ->
                        new RuntimeException(
                                "Custom field không hợp lệ"
                        )
                );

    }

    private CustomFieldOption getOption(
            Long fieldId,
            Long optionId
    ) {

        return optionRepository

                .findByIdAndFieldId(
                        optionId,
                        fieldId
                )

                .orElseThrow(() ->
                        new RuntimeException(
                                "Custom option không hợp lệ"
                        )
                );

    }
    private BigDecimal buildCustomization(
            CartItem cartItem,
            Product product,
            List<CartItemCustomizationRequest> requests
    ) {

        if (requests == null || requests.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalExtraPrice = BigDecimal.ZERO;

        for (CartItemCustomizationRequest request : requests) {

            CustomField field =
                    getField(
                            product,
                            request.getFieldId()
                    );

            CartItemCustomization customization =
                    new CartItemCustomization();

            customization.setCartItem(cartItem);

            customization.setField(field);

            customization.setCreatedAt(
                    LocalDateTime.now()
            );

            switch (field.getFieldType()) {

                case TEXT:
                case TEXTAREA:

                    if (field.getRequired()
                            && !StringUtils.hasText(request.getTextValue())) {

                        throw new RuntimeException(
                                field.getName() + " là bắt buộc"
                        );

                    }

                    customization.setTextValue(
                            request.getTextValue()
                    );

                    customization.setExtraPrice(
                            BigDecimal.ZERO
                    );

                    break;

                case SELECT:
                case RADIO:

                    if (request.getOptionIds() == null
                            || request.getOptionIds().size() != 1) {

                        throw new RuntimeException(
                                field.getName() + " chỉ được chọn một giá trị"
                        );
                    }

                    CustomFieldOption option =
                            getOption(
                                    field.getId(),
                                    request.getOptionIds().get(0)
                            );

                    customization.setOption(option);

                    customization.setExtraPrice(
                            option.getExtraPrice()
                    );

                    totalExtraPrice =
                            totalExtraPrice.add(
                                    option.getExtraPrice()
                            );

                    break;

                case CHECKBOX:

                    if (request.getOptionIds() == null
                            || request.getOptionIds().isEmpty()) {

                        throw new RuntimeException(
                                field.getName() + " chưa được chọn"
                        );
                    }

                    for (Long optionId : request.getOptionIds()) {

                        CustomFieldOption checkboxOption =
                                getOption(
                                        field.getId(),
                                        optionId
                                );

                        CartItemCustomization checkboxCustomization =
                                new CartItemCustomization();

                        checkboxCustomization.setCartItem(cartItem);

                        checkboxCustomization.setField(field);

                        checkboxCustomization.setOption(checkboxOption);

                        checkboxCustomization.setExtraPrice(
                                checkboxOption.getExtraPrice()
                        );

                        checkboxCustomization.setCreatedAt(
                                LocalDateTime.now()
                        );

                        cartItem.getCustomizations()
                                .add(checkboxCustomization);

                        customizationRepository.save(
                                checkboxCustomization
                        );

                        totalExtraPrice =
                                totalExtraPrice.add(
                                        checkboxOption.getExtraPrice()
                                );
                    }

                    continue;

                default:

                    throw new RuntimeException(
                            "Field Type không hỗ trợ"
                    );

            }

            cartItem.getCustomizations().add(
                    customization
            );

            customizationRepository.save(
                    customization
            );

        }

        return totalExtraPrice;

    }
}