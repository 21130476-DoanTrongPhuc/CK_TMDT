package com.example.OneNightProject.review.controller;

import com.example.OneNightProject.review.dto.request.CreateReviewRequest;
import com.example.OneNightProject.review.dto.request.UpdateReviewRequest;
import com.example.OneNightProject.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    @Autowired
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("Authorization")
            String authHeader,
            @RequestBody
            @Valid
            CreateReviewRequest request){

        return ResponseEntity.ok(
                reviewService.createReview(
                        authHeader,
                        request
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long id,
            @RequestBody
            UpdateReviewRequest request){

        return ResponseEntity.ok(
                reviewService.updateReview(
                        authHeader,
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long id){

        reviewService.deleteReview(
                authHeader,
                id
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviews(
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getProductReviews(
                        productId
                )
        );
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<?> getRating(
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getProductRating(
                        productId
                )
        );
    }

    @GetMapping("/product/{productId}/statistic")
    public ResponseEntity<?> statistic(
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getRatingStatistic(
                        productId
                )
        );
    }
}
