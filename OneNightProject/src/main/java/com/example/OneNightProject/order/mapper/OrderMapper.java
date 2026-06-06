package com.example.OneNightProject.order.mapper;

import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.entity.CartItemCustomized;
import com.example.OneNightProject.cart.repository.CartItemCustomizedRepository;
import com.example.OneNightProject.cart.repository.CartItemRepository;
import com.example.OneNightProject.order.dto.request.OrderRequest;
import com.example.OneNightProject.order.dto.response.*;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.entity.OrderItemCustomized;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.order.repository.OrderItemCustomizedRepository;
import com.example.OneNightProject.order.repository.OrderItemRepository;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.user.entity.UserProfile;
import com.example.OneNightProject.user.repository.CustomerProfileRepository;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
                        .price(item.getPrice())
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

                    response.setQuantity(
                            item.getQuantity()
                    );

                    response.setPrice(
                            item.getPrice()
                    );

                    response.setCustomized(
                            item.isCustomized()
                    );

                    response.setCustomizationPrice(
                            item.getPriceCustomProduct()
                    );

                    if(item.getCustomization() != null){

                        response.setCustomText(
                                item.getCustomization()
                                        .getCustom_text()
                        );

                        response.setCustomNote(
                                item.getCustomization()
                                        .getCustom_note()
                        );

                        response.setCustomImage(
                                item.getCustomization()
                                        .getCustom_image()
                        );
                    }

                    return response;
                })
                .toList();
    }
}