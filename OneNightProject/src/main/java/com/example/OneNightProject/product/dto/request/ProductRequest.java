package com.example.OneNightProject.product.dto.request;

import com.example.OneNightProject.product.enums.ProductStatus;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private BigDecimal price;

    private Integer stock;

    private ProductStatus status;

    private Long categoryId;

    private Long brandId;

    private Long sellerId;

    private Boolean allowCustomization;
}
