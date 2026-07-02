package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.request.SaveCustomizationRequest;
import com.example.OneNightProject.product.dto.response.CustomizationResponse;

public interface CustomizationService {

    void saveCustomization(
            String authHeader,
            Long productId,
            SaveCustomizationRequest request
    );

    CustomizationResponse getCustomization(
            String authHeader,
            Long productId
    );

}
