package com.example.OneNightProject.wishlish.service;

import com.example.OneNightProject.wishlish.dto.response.WishlistProductResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface WishlistService {

    void addProduct(Long userId, Long productId);

    void removeProduct(Long userId, Long productId);

    Page<WishlistProductResponse> getWishlist(
            Long userId,
            int page,
            int size
    );

    boolean isFavorite(Long userId, Long productId);
}