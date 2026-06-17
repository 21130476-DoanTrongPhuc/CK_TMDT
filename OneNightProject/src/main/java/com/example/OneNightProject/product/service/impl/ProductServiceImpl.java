package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.product.dto.request.ProductFilterRequest;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.enums.ProductStatus;
import com.example.OneNightProject.product.mapper.ProductMapper;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.repository.ProductSpecification;
import com.example.OneNightProject.product.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {
    @Autowired
    private final ProductRepository productRepository;
    @Autowired
    private final ProductMapper productMapper;
    @Autowired
    private final ProductSpecification productSpecification;

    // =========================
    // CREATE PRODUCT
    // =========================
    @Override
    public ProductResponse create(ProductRequest request) {

        Product product = productMapper.toEntity(request);

        return productMapper.toResponse(
                productRepository.save(product)
        );
    }

    // =========================
    // UPDATE PRODUCT
    // =========================
    @Override
    public ProductResponse update(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        productMapper.updateEntity(product, request);

        return productMapper.toResponse(
                productRepository.save(product)
        );
    }

    // =========================
    // SOFT DELETE PRODUCT
    // =========================
    @Override
    public void delete(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setDeleteAt(LocalDateTime.now());

        productRepository.save(product);
    }

    // =========================
    // GET ALL (PAGINATION)
    // =========================
    @Override
    public Page<ProductResponse> findAll(Pageable pageable) {

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // GET BY ID
    // =========================
    @Override
    public ProductResponse getById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        return productMapper.toResponse(product);
    }

    // =========================
    // FILTER (SPECIFICATION)
    // =========================
    @Override
    public Page<ProductResponse> filterProducts(
            ProductFilterRequest request,
            Pageable pageable) {

        Specification<Product> spec =
                ProductSpecification.filter(request);

        Pageable sortedPageable =
                buildPageable(
                        pageable.getPageNumber(),
                        pageable.getPageSize(),
                        request.getSortBy()
                );

        return productRepository
                .findAll(spec, sortedPageable)
                .map(productMapper::toResponse);
    }

    private Pageable buildPageable(
            int page,
            int size,
            String sortBy
    ) {

        Sort sort = Sort.unsorted();

        if(sortBy == null) {

            return PageRequest.of(
                    page,
                    size
            );
        }

        switch (sortBy) {

            case "price_asc":

                sort = Sort.by(
                        "price"
                ).ascending();

                break;

            case "price_desc":

                sort = Sort.by(
                        "price"
                ).descending();

                break;

            case "name_asc":

                sort = Sort.by(
                        "name"
                ).ascending();

                break;

            case "name_desc":

                sort = Sort.by(
                        "name"
                ).descending();

                break;

            case "rating":

                sort = Sort.by(
                        "averageRating"
                ).descending();

                break;

            case "popularity":

                sort = Sort.by(
                        "soldQuantity"
                ).descending();

                break;
        }

        return PageRequest.of(
                page,
                size,
                sort
        );
    }

    @Override
    public Page<ProductResponse> getProductsBySeller(Long sellerId, Pageable pageable) {
        return productRepository.findBySellerIdAndDeleteAtIsNull(sellerId, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // SEARCH PRODUCT
    // =========================
    public Page<ProductResponse> searchProducts(
            String keyword,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }

            return cb.like(
                    cb.lower(root.get("name")),
                    "%" + keyword.toLowerCase() + "%"
            );
        };

        return productRepository
                .findAll(spec, pageable)
                .map(productMapper::toResponse);
    }

    @Override
    public List<ProductResponse> bestSellingProducts() {
        return null;
    }


    // =========================
    // BY CATEGORY
    // =========================
    public Page<ProductResponse> getByCategory(
            Long categoryId,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) ->
                cb.equal(root.get("category").get("id"), categoryId);

        return productRepository
                .findAll(spec, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // BY BRAND
    // =========================
    public Page<ProductResponse> getByBrand(
            Long brandId,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) ->
                cb.equal(root.get("brand").get("id"), brandId);

        return productRepository
                .findAll(spec, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // BY SELLER
    // =========================
    public Page<ProductResponse> getBySeller(
            Long sellerId,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) ->
                cb.equal(root.get("seller").get("id"), sellerId);

        return productRepository
                .findAll(spec, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // NEWEST PRODUCTS
    // =========================
    public List<ProductResponse> getNewestProducts() {

        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by("createdAt").descending()
        );

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // BEST SELLER (placeholder logic)
    // =========================
    public List<ProductResponse> getBestSellers() {

        // NOTE: cần order_items để tính thật
        Pageable pageable = PageRequest.of(
                0,
                10
        );

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // MOST VIEWED (placeholder logic)
    // =========================
    public List<ProductResponse> getMostViewed() {

        Pageable pageable = PageRequest.of(
                0,
                10
        );

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // RELATED PRODUCTS
    // =========================
    public List<ProductResponse> getRelatedProducts(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        Specification<Product> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("category").get("id"),
                        product.getCategory().getId()),
                cb.notEqual(root.get("id"), productId)
        );

        Pageable pageable = PageRequest.of(0, 8);

        return productRepository
                .findAll(spec, pageable)
                .map(productMapper::toResponse)
                .getContent();
    }
}