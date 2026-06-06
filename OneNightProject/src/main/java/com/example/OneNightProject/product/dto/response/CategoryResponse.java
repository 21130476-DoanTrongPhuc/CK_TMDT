package com.example.OneNightProject.product.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryResponse {

    private Long id;

    private String name;

    private Long parentId;

    private String parentName;
}
