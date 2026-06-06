package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.entity.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    ProductImage uploadImage(Long productId, MultipartFile file);

    List<ProductImage> uploadImages(Long productId, MultipartFile[] files);
}