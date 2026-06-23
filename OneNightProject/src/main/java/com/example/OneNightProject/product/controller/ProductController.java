package com.example.OneNightProject.product.controller;

import com.example.OneNightProject.product.dto.request.ProductFilterRequest;
import com.example.OneNightProject.product.dto.request.ProductRequest;
import com.example.OneNightProject.product.dto.response.ProductResponse;
import com.example.OneNightProject.product.entity.ProductImage;
import com.example.OneNightProject.product.repository.ProductImageRepository;
import com.example.OneNightProject.product.service.ProductImageService;
import com.example.OneNightProject.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {
    @Autowired
    private ProductService productService;
    @Autowired
    private ProductImageService productImageService;
    @Autowired
    private ProductImageRepository imageRepository;

    /**
     * Phân trang sản phẩm
     */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> pagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "true") boolean ascending) {
        Sort sort = ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductResponse> paginate = productService.findAll(pageable);
        return ResponseEntity.ok(paginate);

    }

    /**
     * Tìm sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    /**
     * Tạo sản phẩm
     */
    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    /**
     * Sửa sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    /**
     * Xóa sảm phẩm
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Tìm kiếm sản phẩm và lọc sản phẩm
     */
    @PostMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filterProducts(
            @RequestBody ProductFilterRequest request,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                productService.filterProducts(
                        request,
                        pageable));
    }

    /**
     * Thêm ảnh vào sản phẩm
     */
    @PostMapping(value = "/upload/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductImage upload(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file
    ) {
        return productImageService.uploadImage(authHeader, productId, file);
            @RequestParam("file") MultipartFile file) {
        return productImageService.uploadImage(productId, file);
    }

    /**
     * Lấy danh sách ảnh của product theo ID
     */
    @GetMapping("getImage/{productId}")
    public ResponseEntity<?> getImages(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                imageRepository.findByProductId(
                        productId));
    }

    /**
     * Xóa ảnh theo imageId
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        productImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
