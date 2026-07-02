package com.example.OneNightProject.cart.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CartItemCustomizationRequest {

    private Long fieldId;

    private List<Long> optionIds;

    private String textValue;

}
