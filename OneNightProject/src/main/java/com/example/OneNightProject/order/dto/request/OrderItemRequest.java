package com.example.OneNightProject.order.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class OrderItemRequest {

    private Long productId;

    private Integer quantity;

    private List<OrderItemCustomizationRequest> customizations;

}
