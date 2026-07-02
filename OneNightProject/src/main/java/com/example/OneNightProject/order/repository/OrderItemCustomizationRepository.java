package com.example.OneNightProject.order.repository;

import com.example.OneNightProject.order.entity.OrderItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemCustomizationRepository extends JpaRepository<OrderItemCustomization, Long> {
}
