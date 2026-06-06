package com.example.OneNightProject.payment.repository;

import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder(
            Order order
    );

    Optional<Payment> findTopByOrderOrderByCreatedAtDesc(
            Order order
    );

    List<Payment> findByOrderId(
            Long orderId
    );

    List<Payment> findByOrderIdOrderByCreatedAtDesc(
            Long orderId
    );

    Optional<Payment> findByPaymentCode(
            String paymentCode
    );

}
