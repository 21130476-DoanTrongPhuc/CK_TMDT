package com.example.OneNightProject.product.service.impl;

import com.example.OneNightProject.product.dto.request.CategoryCreateRequest;
import com.example.OneNightProject.product.dto.request.CategoryUpdateRequest;
import com.example.OneNightProject.product.dto.response.CategoryResponse;
import com.example.OneNightProject.product.entity.Category;
import com.example.OneNightProject.product.mapper.CategoryMapper;
import com.example.OneNightProject.product.repository.CategoryRepository;
import com.example.OneNightProject.product.service.CategoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl
        implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse create(
            CategoryCreateRequest request) {

        if(categoryRepository.existsByName(request.getName())){
            throw new RuntimeException(
                    "Category already exists");
        }

        Category category = new Category();

        category.setName(request.getName());

        if(request.getParentId() != null){

            Category parent =
                    categoryRepository.findById(
                                    request.getParentId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parent category not found"));

            category.setParent(parent);
        }

        return categoryMapper.toResponse(
                categoryRepository.save(category));
    }

    @Override
    public CategoryResponse update(
            Long id,
            CategoryUpdateRequest request) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        if(request.getName() != null){
            category.setName(request.getName());
        }

        if(request.getParentId() != null){

            Category parent =
                    categoryRepository.findById(
                                    request.getParentId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parent category not found"));

            category.setParent(parent);
        }

        return categoryMapper.toResponse(
                categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        categoryRepository.delete(category);
    }

    @Override
    public CategoryResponse getById(Long id) {

        return categoryMapper.toResponse(
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found")));
    }

    @Override
    public List<CategoryResponse> getAll() {

        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getRootCategories() {

        return categoryRepository.findByParentIsNull()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getChildren(
            Long parentId) {

        return categoryRepository.findByParentId(parentId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
}
