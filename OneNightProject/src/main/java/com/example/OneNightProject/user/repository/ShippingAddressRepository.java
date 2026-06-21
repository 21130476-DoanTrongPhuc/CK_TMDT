package com.example.OneNightProject.user.repository;

import com.example.OneNightProject.user.entity.ShippingAddress;
import com.example.OneNightProject.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    ShippingAddress findByUserId(Long user_id);
}
