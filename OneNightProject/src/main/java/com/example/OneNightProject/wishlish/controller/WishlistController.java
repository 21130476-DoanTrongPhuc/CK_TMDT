package com.example.OneNightProject.wishlish.controller;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import com.example.OneNightProject.wishlish.dto.response.WishlistProductResponse;
import com.example.OneNightProject.wishlish.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final JwtService jwtService;
    private final CustomerRepository userRepository;

    @PostMapping("/{productId}")
    public ResponseEntity<String> addToWishlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productId
    ) {
        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        Users users = userRepository.findByEmail(email);

        wishlistService.addProduct(users.getId(), productId);

        return ResponseEntity.ok("Added to wishlist");
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeFromWishlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productId
    ) {
        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        Users users = userRepository.findByEmail(email);

        wishlistService.removeProduct(users.getId(), productId);

        return ResponseEntity.ok("Removed from wishlist");
    }

    @GetMapping
    public ResponseEntity<Page<WishlistProductResponse>> getWishlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {

        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        Users users = userRepository.findByEmail(email);

        return ResponseEntity.ok(
                wishlistService.getWishlist(
                        users.getId(),
                        page,
                        size
                )
        );
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productId
    ) {
        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        Users users = userRepository.findByEmail(email);

        return ResponseEntity.ok(
                wishlistService.isFavorite(users.getId(), productId)
        );
    }
}