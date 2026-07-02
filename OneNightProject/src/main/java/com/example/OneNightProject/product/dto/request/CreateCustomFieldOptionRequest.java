package com.example.OneNightProject.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateCustomFieldOptionRequest {

    @NotBlank
    private String label;

    @NotBlank
    private String value;

    private BigDecimal extraPrice;

    private String imageUrl;

    private Integer sortOrder;

}
