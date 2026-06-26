package com.example.OneNightProject.promotion.controller;

import com.example.OneNightProject.promotion.dto.request.PromotionRequest;
import com.example.OneNightProject.promotion.dto.response.PromotionResponse;
import com.example.OneNightProject.promotion.service.PromotionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/seller/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    public PromotionResponse create(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PromotionRequest request
    ) {
        return promotionService.create(authHeader, request);
    }

    @GetMapping
    public Page<PromotionResponse> getMyPromotions(
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable
    ) {
        return promotionService.getMyPromotions(authHeader, pageable);
    }

    @GetMapping("/{id}")
    public PromotionResponse getById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        return promotionService.getById(authHeader, id);
    }

    @PutMapping("/{id}")
    public PromotionResponse update(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody PromotionRequest request
    ) {
        return promotionService.update(authHeader, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        promotionService.delete(authHeader, id);
    }

    @PatchMapping("/{id}/active")
    public PromotionResponse changeActive(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Boolean active
    ) {
        return promotionService.changeActive(authHeader, id, active);
    }
}
