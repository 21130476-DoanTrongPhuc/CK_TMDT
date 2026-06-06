package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.request.ProductFilterRequest;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
    Page<ProductResponse> findAll(Pageable pageable);
    ProductResponse getById(Long id);
    Page<ProductResponse> filterProducts(
            ProductFilterRequest request,
            Pageable pageable);
    Page<ProductResponse> getProductsBySeller(
            Long sellerId,
            Pageable pageable);
    Page<ProductResponse> searchProducts(
            String keyword,
            Pageable pageable);
    List<ProductResponse> bestSellingProducts();
    List<ProductResponse> getMostViewed();
    List<ProductResponse> getNewestProducts();
    List<ProductResponse>
    getRelatedProducts(Long productId);
}
