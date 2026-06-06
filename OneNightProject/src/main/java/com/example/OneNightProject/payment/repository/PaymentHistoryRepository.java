package com.example.OneNightProject.payment.repository;

import com.example.OneNightProject.payment.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository
        extends JpaRepository<PaymentHistory, Long> {

    List<PaymentHistory> findByPaymentIdOrderByCreatedAtDesc(
            Long paymentId
    );
}
