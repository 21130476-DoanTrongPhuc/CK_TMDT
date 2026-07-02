package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.request.CreateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.request.SaveCustomizationRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldOptionRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldOptionResponse;

import java.util.List;

public interface CustomFieldOptionService {

    CustomFieldOptionResponse createOption(
            String authHeader,
            Long fieldId,
            CreateCustomFieldOptionRequest request
    );

    CustomFieldOptionResponse updateOption(
            String authHeader,
            Long optionId,
            UpdateCustomFieldOptionRequest request
    );

    void deleteOption(
            String authHeader,
            Long optionId
    );

    List<CustomFieldOptionResponse> getOptions(
            String authHeader,
            Long fieldId
    );

}
