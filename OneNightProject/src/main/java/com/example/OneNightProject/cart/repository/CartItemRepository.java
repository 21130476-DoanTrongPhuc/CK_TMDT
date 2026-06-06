package com.example.OneNightProject.cart.repository;

import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
