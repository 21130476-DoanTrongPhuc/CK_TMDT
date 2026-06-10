package com.example.OneNightProject.wishlish.service;

import com.example.OneNightProject.wishlish.dto.response.WishlistProductResponse;

import java.util.List;

public interface WishlistService {

    void addProduct(Long userId, Long productId);

    void removeProduct(Long userId, Long productId);

    List<WishlistProductResponse> getWishlist(Long userId);

    boolean isFavorite(Long userId, Long productId);
}