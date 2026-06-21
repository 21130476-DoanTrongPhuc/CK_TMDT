package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.enums.ProductStatus;
import com.example.OneNightProject.product.mapper.ProductMapper;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    private Users getAdmin(String authHeader) {
        String token = authHeader.substring(7);
        Users user = customerRepository.findByEmail(jwtService.extractUsername(token));
        if (user == null || user.getRole() != CustomerEnum.ADMIN) {
            return null;
        }
        return user;
    }

    /**
     * Lấy tất cả sản phẩm (phân trang + filter theo status + tìm kiếm)
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<ProductResponse>> list(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductResponse> result = productRepository.findAllForAdmin(status, keyword, pageable)
                .map(productMapper::toResponse);
        return ResponseEntity.ok(result);
    }

    /**
     * Chi tiết sản phẩm
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductResponse> getById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Product product = productRepository.findById(id).orElse(null);
        if (product == null || product.getDeleteAt() != null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    /**
     * Duyệt sản phẩm → ACTIVE
     */
    @PutMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<ProductResponse> approve(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Product product = productRepository.findById(id).orElse(null);
        if (product == null || product.getDeleteAt() != null) {
            return ResponseEntity.notFound().build();
        }
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    /**
     * Từ chối sản phẩm → REJECTED
     */
    @PutMapping("/{id}/reject")
    @Transactional
    public ResponseEntity<ProductResponse> reject(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (getAdmin(authHeader) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Product product = productRepository.findById(id).orElse(null);
        if (product == null || product.getDeleteAt() != null) {
            return ResponseEntity.notFound().build();
        }
        product.setStatus(ProductStatus.REJECTED);
        productRepository.save(product);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }
}
