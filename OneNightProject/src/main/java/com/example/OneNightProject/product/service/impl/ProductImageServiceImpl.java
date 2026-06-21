package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.entity.ProductImage;
import com.example.OneNightProject.product.repository.ProductImageRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.service.CloudinaryService;
import com.example.OneNightProject.product.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;

    // =========================
    // Upload 1 ảnh
    // =========================
    @Override
    public ProductImage uploadImage(Long productId, MultipartFile file) {
        try {
            validateFile(file);

            Product product = getProduct(productId);

            Map uploadResult = cloudinaryService.upload(file);

            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .publicId(publicId)
                    .build();

            return imageRepository.save(image);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // =========================
    // Xóa 1 ảnh
    // =========================
    @Override
    public void deleteImage(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new NoSuchElementException("Image not found: " + imageId));
        if (image.getPublicId() != null) {
            cloudinaryService.delete(image.getPublicId());
        }
        imageRepository.delete(image);
    }

    // =========================
    // Upload nhiều ảnh
    // =========================
    @Override
    public List<ProductImage> uploadImages(Long productId, MultipartFile[] files) {

        Product product = getProduct(productId);

        List<ProductImage> images = new ArrayList<>();

        for (MultipartFile file : files) {

            validateFile(file);

            Map uploadResult = cloudinaryService.upload(file);

            String imageUrl = uploadResult.get("secure_url").toString();

            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .build();

            images.add(image);
        }

        return imageRepository.saveAll(images);
    }

    // =========================
    // Helper: get product
    // =========================
    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    // =========================
    // Helper: validate file
    // =========================
    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File too large (max 5MB)");
        }

        if (file.getContentType() == null ||
                !file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Invalid file type");
        }
    }
}