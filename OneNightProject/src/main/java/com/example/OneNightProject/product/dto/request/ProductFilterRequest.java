package com.example.OneNightProject.product.dto.request;

import com.example.OneNightProject.product.enums.ProductStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductFilterRequest {

    private String keyword;

    private Long categoryId;

    private Long brandId;

    private Long sellerId;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private Double minRating;

    private ProductStatus status;

    private Boolean allowCustomization;

    // NEW
    private String sortBy;
}
