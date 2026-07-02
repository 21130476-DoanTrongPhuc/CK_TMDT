package com.example.OneNightProject.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomizationResponse {

    private Long productId;

    private String productName;

    private List<CustomFieldResponse> fields;

}
