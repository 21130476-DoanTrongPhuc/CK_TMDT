package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.product.dto.request.ProductFilterRequest;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.mapper.ProductMapper;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.repository.ProductSpecification;
import com.example.OneNightProject.product.repository.ProductViewRepository;
import com.example.OneNightProject.product.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductViewRepository productViewRepository;
    private final ProductSpecification productSpecification;

    // =========================
    // CREATE PRODUCT
    // =========================
    @Override
    public ProductResponse create(ProductRequest request) {

        Product product = productMapper.toEntity(request);

        return productMapper.toResponse(
                productRepository.save(product));
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
                productRepository.save(product));
    }

    // =========================
    // SOFT DELETE
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
    // GET ALL
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
    // FILTER
    // =========================
    @Override
    public Page<ProductResponse> filterProducts(
            ProductFilterRequest request,
            Pageable pageable) {

        Specification<Product> specification =
                ProductSpecification.filter(request);

        Pageable sortedPageable = buildPageable(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                request.getSortBy());

        return productRepository
                .findAll(specification, sortedPageable)
                .map(productMapper::toResponse);
    }

    private Pageable buildPageable(
            int page,
            int size,
            String sortBy) {

        Sort sort = Sort.unsorted();

        if (sortBy == null || sortBy.isBlank()) {
            return PageRequest.of(page, size);
        }

        switch (sortBy) {

            case "price_asc":
                sort = Sort.by("price").ascending();
                break;

            case "price_desc":
                sort = Sort.by("price").descending();
                break;

            case "name_asc":
                sort = Sort.by("name").ascending();
                break;

            case "name_desc":
                sort = Sort.by("name").descending();
                break;

            case "newest":
                sort = Sort.by("createdAt").descending();
                break;

            default:
                sort = Sort.unsorted();
        }

        return PageRequest.of(page, size, sort);
    }

    // =========================
    // PRODUCTS BY SELLER
    // =========================
    @Override
    public Page<ProductResponse> getProductsBySeller(
            Long sellerId,
            Pageable pageable) {

        return productRepository
                .findBySellerIdAndDeleteAtIsNull(sellerId, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // SEARCH
    // =========================
    @Override
    public Page<ProductResponse> searchProducts(
            String keyword,
            Pageable pageable) {

        Specification<Product> specification =
                (root, query, cb) -> {

                    if (keyword == null || keyword.isBlank()) {
                        return cb.conjunction();
                    }

                    return cb.like(
                            cb.lower(root.get("name")),
                            "%" + keyword.toLowerCase() + "%");
                };

        return productRepository
                .findAll(specification, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // BEST SELLING PRODUCTS
    // =========================
    @Override
    public List<ProductResponse> bestSellingProducts() {

        // TODO: Khi có OrderItem thì thay bằng query tính số lượng bán.
        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by("createdAt").descending());

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // NEWEST PRODUCTS
    // =========================
    @Override
    public List<ProductResponse> getNewestProducts() {

        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by("createdAt").descending());

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // MOST VIEWED PRODUCTS
    // =========================
    @Override
    public List<ProductResponse> getMostViewed() {

        // TODO: Thay bằng viewCount khi Product có field này.
        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by("createdAt").descending());

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    // =========================
    // RELATED PRODUCTS
    // =========================
    @Override
    public List<ProductResponse> getRelatedProducts(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        Specification<Product> specification = (root, query, cb) ->
                cb.and(
                        cb.equal(
                                root.get("category").get("id"),
                                product.getCategory().getId()
                        ),
                        cb.notEqual(
                                root.get("id"),
                                productId
                        )
                );

        Pageable pageable = PageRequest.of(0, 8);

        return productRepository
                .findAll(specification, pageable)
                .map(productMapper::toResponse)
                .getContent();
    }

    @Override
    public List<ProductResponse> getTrendingProducts(
            Integer days,
            Integer limit) {

        LocalDateTime fromDate =
                LocalDateTime.now().minusDays(days);

        Pageable pageable =
                PageRequest.of(
                        0,
                        limit
                );

        List<Product> products =
                productViewRepository.findTrendingProducts(
                        fromDate,
                        pageable
                );

        return products.stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // BY CATEGORY
    // =========================
    public Page<ProductResponse> getByCategory(
            Long categoryId,
            Pageable pageable) {

        Specification<Product> specification =
                (root, query, cb) ->
                        cb.equal(
                                root.get("category").get("id"),
                                categoryId);

        return productRepository
                .findAll(specification, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // BY BRAND
    // =========================
    // Lưu ý:
    // Entity Product hiện tại của bạn KHÔNG có field "brand".
    // Nếu đã bỏ Brand thì hãy xóa method này.
    // Nếu thêm lại Brand thì method dưới đây dùng được.
    public Page<ProductResponse> getByBrand(
            Long brandId,
            Pageable pageable) {

        Specification<Product> specification =
                (root, query, cb) ->
                        cb.equal(
                                root.get("brand").get("id"),
                                brandId);

        return productRepository
                .findAll(specification, pageable)
                .map(productMapper::toResponse);
    }

    // =========================
    // BY SELLER
    // =========================
    public Page<ProductResponse> getBySeller(
            Long sellerId,
            Pageable pageable) {

        Specification<Product> specification =
                (root, query, cb) ->
                        cb.equal(
                                root.get("seller").get("id"),
                                sellerId);

        return productRepository
                .findAll(specification, pageable)
                .map(productMapper::toResponse);
    }
}