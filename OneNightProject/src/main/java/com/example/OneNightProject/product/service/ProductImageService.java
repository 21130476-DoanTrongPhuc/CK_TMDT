package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.entity.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    ProductImage uploadImage(String authHeader, Long productId, MultipartFile file);

    List<ProductImage> uploadImages(String authHeader, Long productId, MultipartFile[] files);
}
