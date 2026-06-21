package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.entity.ProductView;
import com.example.OneNightProject.product.mapper.ProductMapper;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.repository.ProductViewRepository;
import com.example.OneNightProject.product.service.ProductViewService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductViewServiceImpl
        implements ProductViewService {

    private final ProductViewRepository productViewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository userRepository;
    private final ProductMapper productMapper;

    @Override
    public void recordView(Long productId, Long userId) {

        Product product = productRepository.findById(productId)
                .orElseThrow();

        Users user = null;

        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElse(null);
        }

        ProductView view = ProductView.builder()
                .product(product)
                .user(user)
                .viewedAt(LocalDateTime.now())
                .build();

        productViewRepository.save(view);
    }

    @Override
    public Long getTotalViews(Long productId) {
        return productViewRepository.countByProductId(productId);
    }

    @Override
    @Transactional
    public List<ProductResponse> getTrendingProducts() {

        LocalDateTime fromDate = LocalDateTime.now().minusDays(7);

        return productViewRepository.findTrendingProducts(
                        fromDate,
                        PageRequest.of(0, 10)
                )
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }
}
