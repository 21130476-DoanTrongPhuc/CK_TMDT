package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.request.CreateCustomFieldRequest;
import com.example.OneNightProject.product.dto.request.SaveCustomizationRequest;
import com.example.OneNightProject.product.dto.request.UpdateCustomFieldRequest;
import com.example.OneNightProject.product.dto.response.CustomFieldResponse;

import java.util.List;

public interface CustomFieldService {

    CustomFieldResponse createField(
            String authHeader,
            Long productId,
            CreateCustomFieldRequest request
    );

    CustomFieldResponse updateField(
            String authHeader,
            Long fieldId,
            UpdateCustomFieldRequest request
    );

    void deleteField(
            String authHeader,
            Long fieldId
    );

    List<CustomFieldResponse> getFields(
            String authHeader,
            Long productId
    );


}
