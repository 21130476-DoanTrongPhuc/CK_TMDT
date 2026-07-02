package com.example.OneNightProject.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CustomFieldOptionResponse {

    private Long id;

    private String label;

    private String value;

    private BigDecimal extraPrice;

    private String imageUrl;

    private Integer sortOrder;

    private Boolean active;

}
