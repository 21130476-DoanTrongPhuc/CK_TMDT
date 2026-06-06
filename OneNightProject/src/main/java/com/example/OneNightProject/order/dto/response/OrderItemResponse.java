package com.example.OneNightProject.order.dto.response;

import com.example.OneNightProject.order.entity.Order;
import lombok.*;

import java.math.BigDecimal;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;

    private Long productId;

    private Integer quantity;

    private BigDecimal price;

    private boolean customized;

    private BigDecimal customizationPrice;
}
