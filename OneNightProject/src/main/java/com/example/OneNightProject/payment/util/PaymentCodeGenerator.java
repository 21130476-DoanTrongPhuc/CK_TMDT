package com.example.OneNightProject.payment.util;

import org.springframework.stereotype.Component;

@Component
public class PaymentCodeGenerator {

    public String generate() {

        return "PAY_"
                + System.currentTimeMillis();
    }
}
