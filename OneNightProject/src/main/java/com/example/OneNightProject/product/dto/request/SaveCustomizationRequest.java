package com.example.OneNightProject.product.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SaveCustomizationRequest {

    private List<CustomFieldRequest> fields;

}
