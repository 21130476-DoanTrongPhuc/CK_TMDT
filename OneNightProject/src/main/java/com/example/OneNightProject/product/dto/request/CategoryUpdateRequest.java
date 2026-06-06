package com.example.OneNightProject.product.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryUpdateRequest {

    private String name;

    private Long parentId;
}
