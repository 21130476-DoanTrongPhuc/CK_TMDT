package com.example.OneNightProject.product.dto.request;

import com.example.OneNightProject.product.enums.CustomFieldType;
import lombok.Data;

import java.util.List;

@Data
public class CustomFieldRequest {

    /**
     * null nếu là field mới
     */
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

    private List<CustomFieldOptionRequest> options;

}
