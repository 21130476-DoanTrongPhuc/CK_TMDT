package com.example.OneNightProject.cart.repository;

import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.entity.CartItemCustomized;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemCustomizedRepository extends JpaRepository<CartItemCustomized, Long> {
    CartItemCustomized findByCartItem(CartItem cartItem);
}
