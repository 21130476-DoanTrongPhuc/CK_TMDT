package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.entity.ProductImage;
import com.example.OneNightProject.product.repository.ProductImageRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.product.service.CloudinaryService;
import com.example.OneNightProject.product.service.ProductImageService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;

    // =========================
    // Upload 1 ảnh
    // =========================
    @Override
    public ProductImage uploadImage(String authHeader, Long productId, MultipartFile file) {
        try{
            Product product = getSellerProduct(authHeader, productId);
            validateFile(file);

            Map uploadResult = cloudinaryService.upload(file);

            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .build();

            return imageRepository.save(image);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    // =========================
    // Upload nhiều ảnh
    // =========================
    @Override
    public List<ProductImage> uploadImages(String authHeader, Long productId, MultipartFile[] files) {

        Product product = getSellerProduct(authHeader, productId);

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
    // Helper: authenticate the seller and enforce product ownership
    // =========================
    private Product getSellerProduct(String authHeader, Long productId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is invalid");
        }

        String token = authHeader.substring(7);
        Users seller = customerRepository.findByEmail(jwtService.extractUsername(token));

        if (seller == null) {
            throw new RuntimeException("User not found");
        }

        if (seller.getRole() != CustomerEnum.SELLER) {
            throw new RuntimeException("Only seller can upload product images");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getSeller() == null ||
                !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You can only upload images to your own product");
        }

        return product;
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
