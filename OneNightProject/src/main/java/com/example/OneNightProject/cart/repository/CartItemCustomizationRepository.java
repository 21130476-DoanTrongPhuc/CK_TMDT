package com.example.OneNightProject.cart.repository;

import com.example.OneNightProject.cart.entity.CartItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemCustomizationRepository
        extends JpaRepository<CartItemCustomization,Long> {
}
