package com.example.OneNightProject.order.repository;

import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
        boolean existsByStatus(
                        OrderStatus status);

        Optional<Order> findFirstByUserIdAndStatus(
                        Long userId,
                        OrderStatus status);

        List<Order> findAllByUserId(
                        Long userId);

        @Query("""
                            SELECT COUNT(oi) > 0
                            FROM Order o
                            JOIN o.orderItems oi
                            WHERE o.id = :orderId
                              AND oi.isCustomized = true
                        """)
        boolean isOrderCustomized(
                        Long orderId);

        Optional<Order> findFirstByUserAndStatus(
                        Users user,
                        OrderStatus status);

        Optional<Order> findByIdAndUserId(
                        Long orderId,
                        Long userId);

        @Query("""
                        SELECT DISTINCT o FROM Order o
                        JOIN o.orderItems oi
                        WHERE oi.productId.seller.id = :sellerId
                        AND o.deletedAt IS NULL
                        ORDER BY o.createdAt DESC
                        """)
        List<Order> findAllBySellerId(@Param("sellerId") Long sellerId);

        @Query("""
                        SELECT COUNT(o) > 0 FROM Order o
                        JOIN o.orderItems oi
                        WHERE o.id = :orderId
                        AND oi.productId.seller.id = :sellerId
                        """)
        boolean existsByIdAndSellerId(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);
}
