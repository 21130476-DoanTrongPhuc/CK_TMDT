package com.example.OneNightProject.promotion.service;

import com.example.OneNightProject.promotion.dto.request.PromotionRequest;
import com.example.OneNightProject.promotion.dto.response.PromotionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PromotionService {

    PromotionResponse create(String authHeader, PromotionRequest request);

    Page<PromotionResponse> getMyPromotions(String authHeader, Pageable pageable);

    PromotionResponse getById(String authHeader, Long id);

    PromotionResponse update(String authHeader, Long id, PromotionRequest request);

    PromotionResponse changeActive(String authHeader, Long id, Boolean active);

    void delete(String authHeader, Long id);
}
