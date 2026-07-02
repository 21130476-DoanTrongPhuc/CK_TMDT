package com.example.OneNightProject.product.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomFieldOptionRequest {

    /**
     * null nếu option mới
     */
    private Long id;

    private String label;

    private String value;

    private BigDecimal extraPrice;

    private String imageUrl;

    private Integer sortOrder;

    private Boolean active;

}