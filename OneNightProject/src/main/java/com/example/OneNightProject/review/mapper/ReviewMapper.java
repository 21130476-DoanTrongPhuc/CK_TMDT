package com.example.OneNightProject.review.mapper;

import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(
            Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}