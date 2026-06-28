package com.example.OneNightProject.review.controller;

import com.example.OneNightProject.review.dto.request.CreateReviewRequest;
import com.example.OneNightProject.review.dto.request.UpdateReviewRequest;
import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.enums.ReviewSortType;
import com.example.OneNightProject.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    @Autowired
    private final ReviewService reviewService;

    /**
     * Viết review mới
     */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("Authorization")
            String authHeader,
            @RequestBody
            @Valid
            CreateReviewRequest request) {

        try {

            ReviewResponse response =
                    reviewService.createReview(
                            authHeader,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    ));

        } catch (Exception ex) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Internal server error"
                    ));
        }
    }

    /**
     * Sửa Review
     */
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

    /**
     * Xóa review
     */
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

    /**
     * Lấy danh sách review của sản phẩm
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviews(
            @PathVariable Long productId,

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size,

            @RequestParam(required = false)
            Integer rating,

            @RequestParam(defaultValue = "NEWEST")
            ReviewSortType sortType) {

        return ResponseEntity.ok(
                reviewService.getProductReviews(
                        productId,
                        page,
                        size,
                        rating,
                        sortType
                )
        );
    }

    /**
     * Danh sách rating của sản phẩm
     */
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<?> getRating(
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getProductRating(
                        productId
                )
        );
    }

    /**
     * Thống kê rating của sản phẩm
     */
    @GetMapping("/product/{productId}/statistic")
    public ResponseEntity<?> statistic(
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getRatingStatistic(
                        productId
                )
        );
    }

    /**
     *ấy review của sản phẩm cụ thể từ user
     */
    @GetMapping("/product/{productId}/me")
    public ResponseEntity<ReviewResponse> getReviewUser(
            @RequestHeader("Authorization")
            String authHeader,
            @PathVariable Long productId){

        return ResponseEntity.ok(
                reviewService.getReviewUser(
                        authHeader,
                        productId
                )
        );
    }
}
