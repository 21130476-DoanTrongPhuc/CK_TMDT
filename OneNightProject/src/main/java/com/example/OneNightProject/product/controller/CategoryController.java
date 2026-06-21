package com.example.OneNightProject.product.controller;

import com.example.OneNightProject.product.dto.request.CategoryCreateRequest;
import com.example.OneNightProject.product.dto.request.CategoryUpdateRequest;
import com.example.OneNightProject.product.dto.response.CategoryResponse;
import com.example.OneNightProject.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @RequestBody
            @Valid CategoryCreateRequest request) {

        return ResponseEntity.ok(
                categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @RequestBody CategoryUpdateRequest request) {

        return ResponseEntity.ok(
                categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        categoryService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                categoryService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>>
    getAll() {

        return ResponseEntity.ok(
                categoryService.getAll());
    }

    @GetMapping("/roots")
    public ResponseEntity<List<CategoryResponse>>
    getRoots() {

        return ResponseEntity.ok(
                categoryService.getRootCategories());
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<CategoryResponse>>
    getChildren(@PathVariable Long id) {

        return ResponseEntity.ok(
                categoryService.getChildren(id));
    }
}