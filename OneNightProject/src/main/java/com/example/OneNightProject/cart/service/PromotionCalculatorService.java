package com.example.OneNightProject.cart.service;

import com.example.OneNightProject.cart.dto.response.PromotionResult;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.promotion.entity.Promotion;

import java.math.BigDecimal;

public interface PromotionCalculatorService {

    PromotionResult calculate(Product product);

}
