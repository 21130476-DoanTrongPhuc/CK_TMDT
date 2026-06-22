package com.example.OneNightProject.order.repository;

import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    boolean existsByStatus(
            OrderStatus status
    );

    Optional<Order> findFirstByUserIdAndStatus(
            Long userId,
            OrderStatus status
    );

    List<Order> findAllByUserId(
            Long userId
    );

    @Query("""
            SELECT COUNT(oi) > 0
            FROM Order o
            JOIN o.orderItems oi
            WHERE o.id = :orderId
              AND oi.isCustomized = true
        """)
    boolean isOrderCustomized(
            Long orderId
    );

    Optional<Order> findFirstByUserAndStatus(
            Users user,
            OrderStatus status
    );

    Optional<Order> findByIdAndUserId(
            Long orderId,
            Long userId
    );

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN o.orderItems oi
            JOIN oi.productId p
            WHERE p.seller.id = :sellerId
            """)
    List<Order> findDistinctBySellerId(Long sellerId);
}
