package com.example.OneNightProject.wishlish.repository;

import com.example.OneNightProject.wishlish.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository
        extends JpaRepository<WishlistItem, Long> {

    Optional<WishlistItem> findByWishlistIdAndProductId(
            Long wishlistId,
            Long productId
    );

    List<WishlistItem> findAllByWishlistId(Long wishlistId);

    void deleteByWishlistIdAndProductId(
            Long wishlistId,
            Long productId
    );
}
