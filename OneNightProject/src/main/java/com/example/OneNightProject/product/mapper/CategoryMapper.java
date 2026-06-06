package com.example.OneNightProject.product.mapper;

import com.example.OneNightProject.product.dto.response.CategoryResponse;
import com.example.OneNightProject.product.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(
                        category.getParent() != null
                                ? category.getParent().getId()
                                : null
                )
                .parentName(
                        category.getParent() != null
                                ? category.getParent().getName()
                                : null
                )
                .build();
    }
}
