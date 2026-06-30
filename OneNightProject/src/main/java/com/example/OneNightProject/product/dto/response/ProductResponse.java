package com.example.OneNightProject.product.dto.response;

import com.example.OneNightProject.product.enums.ProductStatus;
import com.example.OneNightProject.promotion.dto.response.PromotionResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer stock;

    private ProductStatus status;

    private Boolean allowCustomization;

    private Long categoryId;
    private String categoryName;

    private Long brandId;
    private String brandName;

    private Long sellerId;
    private String sellerName;

    private Double averageRating;

    private Long totalReviews;

    private Boolean checkWishlist;

    private List<ProductImageResponse> images;

    private LocalDateTime createdAt;

    private PromotionResponse promotionResponse;
}
