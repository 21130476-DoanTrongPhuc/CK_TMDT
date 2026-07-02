package com.example.OneNightProject.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemCustomizationResponse {

    private Long fieldId;

    private String fieldName;

    private Long optionId;

    private String optionLabel;

    private String textValue;

    private BigDecimal extraPrice;
}
