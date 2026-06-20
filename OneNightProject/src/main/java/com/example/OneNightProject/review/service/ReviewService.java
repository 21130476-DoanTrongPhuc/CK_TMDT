package com.example.OneNightProject.review.service;

import com.example.OneNightProject.review.dto.request.CreateReviewRequest;
import com.example.OneNightProject.review.dto.request.UpdateReviewRequest;
import com.example.OneNightProject.review.dto.response.ProductRatingResponse;
import com.example.OneNightProject.review.dto.response.RatingStatisticResponse;
import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.enums.ReviewSortType;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ReviewService {

    ReviewResponse createReview(
            String authHeader,
            CreateReviewRequest request);

    ReviewResponse updateReview(
            String authHeader,
            Long reviewId,
            UpdateReviewRequest request);

    void deleteReview(
            String authHeader,
            Long reviewId);

    Page<ReviewResponse> getProductReviews(
            Long productId,
            Integer page,
            Integer size,
            Integer rating,
            ReviewSortType sortType
    );

    ProductRatingResponse getProductRating(
            Long productId);

    RatingStatisticResponse getRatingStatistic(
            Long productId);

    void hideReview(Long reviewId);

    void showReview(Long reviewId);
}
