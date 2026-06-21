package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.entity.Review;
import com.example.OneNightProject.review.enums.ReviewStatus;
import com.example.OneNightProject.review.mapper.ReviewMapper;
import com.example.OneNightProject.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReviewResponse>> list() {
        List<ReviewResponse> reviews = reviewRepository
                .findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null || review.getDeletedAt() != null) {
            return ResponseEntity.notFound().build();
        }
        review.setStatus(ReviewStatus.valueOf(body.get("status")));
        reviewRepository.save(review);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null || review.getDeletedAt() != null) {
            return ResponseEntity.notFound().build();
        }
        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);
        return ResponseEntity.noContent().build();
    }
}
