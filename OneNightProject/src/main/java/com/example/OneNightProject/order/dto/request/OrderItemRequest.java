package com.example.OneNightProject.order.dto.request;

import lombok.Data;

@Data
public class OrderItemRequest {

    private Long productId;

    private Integer quantity;

    private String customText;

    private String customNote;

    private String customImage;
}
