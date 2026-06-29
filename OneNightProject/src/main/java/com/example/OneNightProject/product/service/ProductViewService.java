package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.dto.response.ProductViewResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductViewService {

    void recordView(Long productId, Long userId);

    Long getTotalViews(Long productId);

    List<ProductResponse> getTrendingProducts();

    ProductViewResponse createViewProduct(String authHeader, Long productId);
}
