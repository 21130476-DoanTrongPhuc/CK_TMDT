package com.example.OneNightProject.product.dto.response;

import com.example.OneNightProject.product.enums.CustomFieldType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CustomFieldResponse {

    private Long id;

    private String name;

    private String description;

    private CustomFieldType fieldType;

    private Boolean required;

    private String placeholder;

    private Integer minLength;

    private Integer maxLength;

    private Integer sortOrder;

    private Boolean active;

    private List<CustomFieldOptionResponse> options;

}
