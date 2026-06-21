package com.example.OneNightProject.order.dto.request;

import com.example.OneNightProject.cart.dto.response.CartResponse;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Data
@RequiredArgsConstructor
public class OrderRequest {
    private String fullName;
    private String phoneNumber;
    private String shippingAddress;
}
