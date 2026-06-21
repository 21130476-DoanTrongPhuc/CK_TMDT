package com.example.OneNightProject.product.mapper;

import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductImageResponse;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Category;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.entity.ProductImage;
import com.example.OneNightProject.product.repository.CategoryRepository;
import com.example.OneNightProject.review.enums.ReviewStatus;
import com.example.OneNightProject.review.repository.ReviewRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductMapper {

        @Autowired
        private final ReviewRepository reviewRepository;
        @Autowired
        private final CustomerRepository userRepository;
        @Autowired
        private final CategoryRepository categoryRepository;

        public Product toEntity(ProductRequest request) {
                Product product = new Product();
                Users users = userRepository.findById(request.getSellerId()).orElseThrow();

                product.setName(request.getName());
                product.setDescription(request.getDescription());
                product.setPrice(request.getPrice());
                product.setStock(request.getStock());
                product.setStatus(request.getStatus());
                product.setAllowCustomization(request.getAllowCustomization());
                product.setSeller(users);

                if (request.getCategoryId() != null) {
                        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
                        product.setCategory(category);
                }

                return product;
        }

        public ProductResponse toResponse(Product product) {
                Double avgRating = reviewRepository
                                .getAverageRating(product.getId());

                Long totalReviews = reviewRepository
                                .countByProductIdAndStatus(
                                                product.getId(),
                                                ReviewStatus.VISIBLE);

                List<ProductImageResponse> images = product.getImages() == null
                                ? Collections.emptyList()
                                : product.getImages()
                                                .stream()
                                                .map(this::toImageResponse)
                                                .toList();

                return ProductResponse.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .description(product.getDescription())
                                .price(product.getPrice())
                                .stock(product.getStock())
                                .status(product.getStatus())

                                .allowCustomization(
                                                product.getAllowCustomization())

                                .categoryId(
                                                product.getCategory() != null
                                                                ? product.getCategory().getId()
                                                                : null)

                                .categoryName(
                                                product.getCategory() != null
                                                                ? product.getCategory().getName()
                                                                : null)

                                .sellerId(
                                                product.getSeller().getId())

                                .sellerName(
                                                product.getSeller().getFullName())

                                .averageRating(
                                                avgRating == null ? 0.0 : avgRating)

                                .totalReviews(totalReviews)

                                .images(images)

                                .createdAt(product.getCreatedAt())

                                .build();
        }

        private ProductImageResponse toImageResponse(
                        ProductImage image) {

                return new ProductImageResponse(
                                image.getId(),
                                image.getImageUrl());
        }

        public void updateEntity(
                        Product product,
                        ProductRequest request) {

                if (request.getName() != null) {
                        product.setName(request.getName());
                }

                if (request.getDescription() != null) {
                        product.setDescription(request.getDescription());
                }

                if (request.getPrice() != null) {
                        product.setPrice(request.getPrice());
                }

                if (request.getStock() != null) {
                        product.setStock(request.getStock());
                }

                if (request.getStatus() != null) {
                        product.setStatus(request.getStatus());
                }

                if (request.getAllowCustomization() != null) {
                        product.setAllowCustomization(
                                        request.getAllowCustomization());
                }

                if (request.getCategoryId() != null) {
                        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
                        product.setCategory(category);
                }
        }
}
