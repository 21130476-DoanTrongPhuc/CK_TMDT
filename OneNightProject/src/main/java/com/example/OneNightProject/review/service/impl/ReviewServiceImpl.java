package com.example.OneNightProject.review.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.review.dto.request.CreateReviewRequest;
import com.example.OneNightProject.review.dto.request.UpdateReviewRequest;
import com.example.OneNightProject.review.dto.response.ProductRatingResponse;
import com.example.OneNightProject.review.dto.response.RatingStatisticResponse;
import com.example.OneNightProject.review.dto.response.ReviewResponse;
import com.example.OneNightProject.review.entity.Review;
import com.example.OneNightProject.review.enums.ReviewSortType;
import com.example.OneNightProject.review.enums.ReviewStatus;
import com.example.OneNightProject.review.mapper.ReviewMapper;
import com.example.OneNightProject.review.repository.ReviewRepository;
import com.example.OneNightProject.review.service.ReviewService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private OrderRepository orderRepository;
    @Autowired
    private ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse createReview(
            String authHeader,
            CreateReviewRequest request) {

        String token = authHeader.substring(7);

        Users user = userRepository.findByEmail(
                jwtService.extractUsername(token)
        );

        Product product = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new RuntimeException("Product not found"));

        // Kiểm tra đã review chưa
        boolean reviewed = reviewRepository
                .findByUserIdAndProductId(
                        user.getId(),
                        product.getId()
                )
                .isPresent();

        if (reviewed) {
            throw new RuntimeException(
                    "You already reviewed this product"
            );
        }

        // Kiểm tra user đã mua và nhận hàng chưa
        List<Order> orders =
                orderRepository.findAllByUserId(
                        user.getId()
                );

        boolean purchased = orders.stream()

                // Đơn hàng đã giao thành công
//                .filter(order ->
//                        order.getStatus() == OrderStatus.SHIPPED
//                )

                // Đã thanh toán
                .filter(order ->
                        order.getPaymentStatus() == PaymentStatusOrder.PAID
                                || order.getPaymentStatus() == PaymentStatusOrder.PARTIALLY_PAID
                )

                // Có chứa sản phẩm cần review
                .anyMatch(order ->
                        order.getOrderItems().stream()
                                .anyMatch(item ->
                                        item.getProductId()
                                                .equals(product)
                                )
                );

        if (!purchased) {
            throw new RuntimeException(
                    "You must purchase and receive this product before reviewing"
            );
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

        Users user = userRepository.findByEmail(jwtService.extractUsername(token));

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow();

        if(!review.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Forbidden");
        }

        List<Review> reviewList = user.getReviewList();
        reviewList.remove(review);

        userRepository.save(user);

        reviewRepository.deleteById(review.getId());

        review.setDeletedAt(
                LocalDateTime.now());
    }

    @Override
    public Page<ReviewResponse> getProductReviews(
            Long productId,
            Integer page,
            Integer size,
            Integer rating,
            ReviewSortType sortType) {

        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm"
                ));

        Sort sort = switch (sortType) {
            case OLDEST -> Sort.by("createdAt").ascending();
            default -> Sort.by("createdAt").descending();
        };

        Pageable pageable = PageRequest.of(
                page,
                size,
                sort
        );

        Page<Review> reviews;

        if (rating != null) {

            reviews = reviewRepository
                    .findByProductIdAndRatingAndStatusAndDeletedAtIsNull(
                            productId,
                            rating,
                            ReviewStatus.VISIBLE,
                            pageable
                    );

        } else {

            reviews = reviewRepository
                    .findByProductIdAndStatusAndDeletedAtIsNull(
                            productId,
                            ReviewStatus.VISIBLE,
                            pageable
                    );
        }

        return reviews.map(review ->
                ReviewResponse.builder()
                        .id(review.getId())
                        .userId(review.getUser().getId())
                        .userName(review.getUser().getFullName())
                        .productId(review.getProduct().getId())
                        .productName(review.getProduct().getName())
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .status(review.getStatus())
                        .createdAt(review.getCreatedAt())
                        .build()
        );
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

    @Override
    public ReviewResponse getReviewUser(String authHeader, Long productId) {
        String token = authHeader.substring(7);

        Users user = userRepository.findByEmail(
                jwtService.extractUsername(token)
        );

        Review review = reviewRepository.findByUser_IdAndProduct_Id(user.getId(),productId);

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
