package com.example.OneNightProject.review.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.review.dto.request.CreateReviewRequest;
import com.example.OneNightProject.review.dto.request.UpdateReviewRequest;
import com.example.OneNightProject.review.dto.response.ProductRatingResponse;
import com.example.OneNightProject.review.dto.response.RatingStatisticResponse;
import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.entity.Review;
import com.example.OneNightProject.review.enums.ReviewStatus;
import com.example.OneNightProject.review.mapper.ReviewMapper;
import com.example.OneNightProject.review.repository.ReviewRepository;
import com.example.OneNightProject.review.service.ReviewService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private CustomerRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse createReview(
            String authHeader,
            CreateReviewRequest request) {

        String token = authHeader.substring(7);

        Users user =
                userRepository.findByEmail(
                        jwtService.extractUsername(token));

        Product product =
                productRepository.findById(
                                request.getProductId())
                        .orElseThrow();

        boolean reviewed =
                reviewRepository
                        .findByUserIdAndProductId(
                                user.getId(),
                                product.getId())
                        .isPresent();

        if(reviewed){
            throw new RuntimeException(
                    "You already reviewed this product");
        }

        Review review = new Review();

        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(ReviewStatus.VISIBLE);
        review.setCreatedAt(LocalDateTime.now());

        reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(
            String authHeader,
            Long reviewId,
            UpdateReviewRequest request) {

        String token = authHeader.substring(7);

        Users user =
                userRepository.findByEmail(
                        jwtService.extractUsername(token));

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow();

        if(!review.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Forbidden");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(
            String authHeader,
            Long reviewId) {

        String token = authHeader.substring(7);

        Users user =
                userRepository.findByEmail(
                        jwtService.extractUsername(token));

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow();

        if(!review.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Forbidden");
        }

        review.setDeletedAt(
                LocalDateTime.now());

        reviewRepository.save(review);
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {
        return null;
    }

    @Override
    public ProductRatingResponse
    getProductRating(Long productId) {

        Double avg =
                reviewRepository
                        .getAverageRating(productId);

        Long total =
                reviewRepository
                        .countByProductIdAndStatus(
                                productId,
                                ReviewStatus.VISIBLE);

        return ProductRatingResponse.builder()
                .averageRating(avg == null ? 0 : avg)
                .totalReviews(total)
                .build();
    }

    @Override
    public RatingStatisticResponse
    getRatingStatistic(Long productId) {

        return RatingStatisticResponse.builder()
                .oneStar(
                        reviewRepository.countByProductIdAndRating(
                                productId,1))
                .twoStar(
                        reviewRepository.countByProductIdAndRating(
                                productId,2))
                .threeStar(
                        reviewRepository.countByProductIdAndRating(
                                productId,3))
                .fourStar(
                        reviewRepository.countByProductIdAndRating(
                                productId,4))
                .fiveStar(
                        reviewRepository.countByProductIdAndRating(
                                productId,5))
                .build();
    }

    @Override
    public void hideReview(Long reviewId) {

    }

    @Override
    public void showReview(Long reviewId) {

    }
}
