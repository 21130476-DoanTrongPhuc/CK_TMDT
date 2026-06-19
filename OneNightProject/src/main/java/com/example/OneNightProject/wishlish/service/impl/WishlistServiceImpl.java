package com.example.OneNightProject.wishlish.service.impl;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import com.example.OneNightProject.wishlish.dto.response.WishlistProductResponse;
import com.example.OneNightProject.wishlish.entity.Wishlist;
import com.example.OneNightProject.wishlish.entity.WishlistItem;
import com.example.OneNightProject.wishlish.repository.WishlistItemRepository;
import com.example.OneNightProject.wishlish.repository.WishlistRepository;
import com.example.OneNightProject.wishlish.service.WishlistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;

    private final WishlistItemRepository wishlistItemRepository;

    private final CustomerRepository userRepository;

    private final ProductRepository productRepository;

    @Override
    public void addProduct(Long userId, Long productId) {

        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElseGet(() -> {

                    Users user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

                    Wishlist newWishlist = Wishlist.builder()
                            .user(user)
                            .build();

                    return wishlistRepository.save(newWishlist);
                });

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        boolean exists = wishlistItemRepository
                .findByWishlistIdAndProductId(
                        wishlist.getId(),
                        productId
                )
                .isPresent();

        if (exists) {
            return;
        }

        WishlistItem item = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build();

        wishlistItemRepository.save(item);
    }

    @Override
    public void removeProduct(Long userId, Long productId) {

        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wishlist not found"));

        wishlistItemRepository.deleteByWishlistIdAndProductId(
                wishlist.getId(),
                productId
        );
    }

    @Override
    @Transactional
    public Page<WishlistProductResponse> getWishlist(
            Long userId,
            int page,
            int size
    ) {

        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wishlist not found"));

        Pageable pageable = PageRequest.of(page, size);

        return wishlistItemRepository
                .findAllByWishlistId(wishlist.getId(), pageable)
                .map(item -> {

                    Product product = item.getProduct();

                    String image = product.getImages() != null
                            && !product.getImages().isEmpty()
                            ? product.getImages().get(0).getImageUrl()
                            : null;

                    return WishlistProductResponse.builder()
                            .productId(product.getId())
                            .name(product.getName())
                            .price(product.getPrice())
                            .stock(product.getStock())
                            .imageUrl(image)
                            .build();
                });
    }

    @Override
    public boolean isFavorite(Long userId, Long productId) {

        return wishlistRepository.findByUserId(userId)
                .flatMap(wishlist ->
                        wishlistItemRepository
                                .findByWishlistIdAndProductId(
                                        wishlist.getId(),
                                        productId
                                ))
                .isPresent();
    }
}
