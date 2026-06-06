package com.example.OneNightProject.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {
    private Long id;
    private String image_url;
}
