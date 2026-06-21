package com.example.OneNightProject.review.repository;

import com.example.OneNightProject.review.entity.Review;
import com.example.OneNightProject.review.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    Optional<Review> findByUserIdAndProductId(
            Long userId,
            Long productId);

    List<Review> findByProductIdAndStatus(
            Long productId,
            ReviewStatus status);

    List<Review> findByUserId(Long userId);

    long countByProductIdAndRating(
            Long productId,
            Integer rating);

    @Query("""
            SELECT AVG(r.rating)
            FROM Review r
            WHERE r.product.id = :productId
            AND r.status = 'VISIBLE'
            """)
    Double getAverageRating(Long productId);

    long countByProductIdAndStatus(
            Long productId,
            ReviewStatus status);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.seller.id = :sellerId AND r.createdAt >= :since")
    long countNewBySellerId(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);

    List<Review> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
}
