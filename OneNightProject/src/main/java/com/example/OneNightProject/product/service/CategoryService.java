package com.example.OneNightProject.product.service;

import com.example.OneNightProject.product.dto.request.CategoryCreateRequest;
import com.example.OneNightProject.product.dto.request.CategoryUpdateRequest;
import com.example.OneNightProject.product.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryCreateRequest request);

    CategoryResponse update(Long id,
                            CategoryUpdateRequest request);

    void delete(Long id);

    CategoryResponse getById(Long id);

    List<CategoryResponse> getAll();

    List<CategoryResponse> getRootCategories();

    List<CategoryResponse> getChildren(Long parentId);
}
