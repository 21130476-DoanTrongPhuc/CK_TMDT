package com.example.OneNightProject.review.dto.response;

import com.example.OneNightProject.review.enums.ReviewStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReviewResponse {

    private Long id;

    private Long userId;

    private String userName;

    private Long productId;

    private String productName;

    private Integer rating;

    private String comment;

    private ReviewStatus status;

    private LocalDateTime createdAt;
}
