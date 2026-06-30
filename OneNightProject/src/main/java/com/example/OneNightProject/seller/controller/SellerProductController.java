package com.example.OneNightProject.seller.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.ProductImage;
import com.example.OneNightProject.product.service.ProductImageService;
import com.example.OneNightProject.product.service.ProductService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/seller/products")
@RequiredArgsConstructor
public class SellerProductController {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final ProductImageService productImageService;
    private final ProductService productService;

    private Users getSeller(String authHeader) {
        String token = authHeader.substring(7);
        return customerRepository.findByEmail(jwtService.extractUsername(token));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> list(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size) {
        Users seller = getSeller(authHeader);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(productService.getProductsBySeller(seller.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProductRequest request) {
        Users seller = getSeller(authHeader);
        request.setSellerId(seller.getId());
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        Users seller = getSeller(authHeader);
        ProductResponse existing = productService.getById(id);
        if (!existing.getSellerId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Users seller = getSeller(authHeader);
        ProductResponse existing = productService.getById(id);
        if (!existing.getSellerId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload 1 ảnh cho sản phẩm
     */
    @PostMapping(
            value = "/upload/{productId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductImage upload(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file) {

        return productImageService.uploadImage(
                authHeader,
                productId,
                file);
    }
}
