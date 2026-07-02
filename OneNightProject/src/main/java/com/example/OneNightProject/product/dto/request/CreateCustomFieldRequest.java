package com.example.OneNightProject.product.dto.request;

import com.example.OneNightProject.product.enums.CustomFieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCustomFieldRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private CustomFieldType fieldType;

    private Boolean required;

    private String placeholder;

    private Integer minLength;

    private Integer maxLength;

    private Integer sortOrder;

}
