package com.example.OneNightProject.payment.service.impl;

import com.example.OneNightProject.payment.entity.Payment;
import com.example.OneNightProject.payment.entity.PaymentHistory;
import com.example.OneNightProject.payment.enums.PaymentAction;
import com.example.OneNightProject.payment.repository.PaymentHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentHistoryService {

    private final PaymentHistoryRepository repository;

    public void saveHistory(
            Payment payment,
            PaymentAction action,
            String description
    ) {

        PaymentHistory history =
                PaymentHistory.builder()
                        .payment(payment)
                        .action(action)
                        .description(description)
                        .build();

        repository.save(history);
    }
}
