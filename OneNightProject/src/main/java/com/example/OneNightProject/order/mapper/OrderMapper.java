package com.example.OneNightProject.order.mapper;


import com.example.OneNightProject.order.dto.response.*;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.entity.OrderItemCustomization;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class OrderMapper {

    public OrderResponse toOrderResponse(Order order) {

        if (order == null) return null;

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .orderCode(order.getOrderCode())
                .totalPrice(order.getTotalPrice())
                .shippingAddress(order.getShippingAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .paidAmount(order.getPaidAmount())
                .remainingAmount(order.getRemainingAmount())
                .paymentStatus(order.getPaymentStatus())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(mapItems(order.getOrderItems()))
                .build();
    }

    private List<OrderItemResponse> mapItems(List<OrderItem> items) {

        if (items == null) return new ArrayList<>();

        return items.stream().map(item ->
                OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId().getId())
                        .quantity(item.getQuantity())
                        .originalPrice(item.getOriginalPrice())
                        .discountPrice(item.getDiscountPrice())
                        .discountAmount(item.getDiscountAmount())
                        .price(item.getPrice())
                        .promotionName(item.getPromotionName())
                        .customized(item.isCustomized())
                        .customizationPrice(item.getPriceCustomProduct())
                        .build()
        ).toList();
    }

    public OrderListResponse toListResponse(
            Order order
    ){

        return OrderListResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .createdAt(order.getCreatedAt())
                .totalItems(
                        order.getOrderItems() == null
                                ? 0
                                : order.getOrderItems()
                                .size()
                )
                .build();
    }

    public OrderListResponse toSellerListResponse(
            Order order,
            Long sellerId
    ) {
        List<OrderItem> sellerItems = order.getOrderItems() == null
                ? Collections.emptyList()
                : order.getOrderItems().stream()
                .filter(item -> item.getProductId() != null)
                .filter(item -> item.getProductId().getSeller() != null)
                .filter(item -> item.getProductId().getSeller().getId().equals(sellerId))
                .toList();

        BigDecimal sellerTotal = sellerItems.stream()
                .map(this::calculateItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int sellerTotalItems = sellerItems.stream()
                .map(OrderItem::getQuantity)
                .filter(java.util.Objects::nonNull)
                .reduce(0, Integer::sum);

        return OrderListResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalPrice(sellerTotal)
                .totalItems(sellerTotalItems)
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private BigDecimal calculateItemTotal(OrderItem item) {

        int quantity =
                item.getQuantity() == null
                        ? 0
                        : item.getQuantity();

        BigDecimal unitPrice =
                item.getPrice() == null
                        ? BigDecimal.ZERO
                        : item.getPrice();

        BigDecimal customizationPrice =
                item.getPriceCustomProduct() == null
                        ? BigDecimal.ZERO
                        : item.getPriceCustomProduct();

        return unitPrice
                .add(customizationPrice)
                .multiply(BigDecimal.valueOf(quantity));
    }

    public OrderDetailResponse toDetailResponse(
            Order order
    ){

        return OrderDetailResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .totalPrice(order.getTotalPrice())
                .paidAmount(order.getPaidAmount())
                .remainingAmount(order.getRemainingAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(mapOrderItems(order))
                .statusHistories(
                        mapStatusHistories(order)
                )
                .build();
    }

    private List<OrderStatusHistoryResponse>
    mapStatusHistories(Order order) {

        if(order.getStatusHistories() == null){
            return Collections.emptyList();
        }

        return order.getStatusHistories()
                .stream()
                .map(history ->
                        OrderStatusHistoryResponse
                                .builder()
                                .oldStatus(
                                        history.getOldStatus()
                                )
                                .newStatus(
                                        history.getNewStatus()
                                )
                                .changedAt(
                                        history.getChangedAt()
                                )
                                .build()
                )
                .toList();
    }

    private List<OrderItemDetailResponse> mapOrderItems(
            Order order
    ) {

        if(order.getOrderItems() == null){
            return Collections.emptyList();
        }

        return order.getOrderItems()
                .stream()
                .map(item -> {

                    OrderItemDetailResponse response =
                            new OrderItemDetailResponse();

                    response.setId(item.getId());

                    response.setProductId(
                            item.getProductId().getId()
                    );

                    response.setProductName(
                            item.getProductId().getName()
                    );

                    response.setQuantity(
                            item.getQuantity()
                    );

                    response.setOriginalPrice(
                            item.getOriginalPrice()
                    );

                    response.setDiscountPrice(
                            item.getDiscountPrice()
                    );

                    response.setDiscountAmount(
                            item.getDiscountAmount()
                    );

                    response.setPromotionName(
                            item.getPromotionName()
                    );

                    response.setCustomized(
                            item.isCustomized()
                    );

                    response.setCustomizationPrice(
                            item.getPriceCustomProduct()
                    );

                    response.setCustomizations(
                            mapCustomizations(
                                    item.getCustomizations()
                            )
                    );

                    return response;
                })
                .toList();
    }

    private List<OrderItemCustomizationResponse> mapCustomizations(
            List<OrderItemCustomization> customizations
    ) {

        if (customizations == null) {
            return Collections.emptyList();
        }

        return customizations.stream()
                .map(customization ->
                        OrderItemCustomizationResponse.builder()

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
}
