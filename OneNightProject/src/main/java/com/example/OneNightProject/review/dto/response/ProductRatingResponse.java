package com.example.OneNightProject.review.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductRatingResponse {

    private Double averageRating;

    private Long totalReviews;
}
