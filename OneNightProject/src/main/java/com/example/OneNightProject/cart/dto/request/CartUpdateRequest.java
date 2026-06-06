package com.example.OneNightProject.cart.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class CartUpdateRequest {
    private Integer quantity;
}
