package com.example.OneNightProject.cart.service.impl;

import com.example.OneNightProject.cart.dto.response.PromotionResult;
import com.example.OneNightProject.cart.service.PromotionCalculatorService;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.promotion.entity.Promotion;
import com.example.OneNightProject.promotion.enums.ApplyType;
import com.example.OneNightProject.promotion.enums.DiscountType;
import com.example.OneNightProject.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionCalculatorServiceImpl
        implements PromotionCalculatorService {

    private final PromotionRepository promotionRepository;

    @Override
    public PromotionResult calculate(Product product) {

        BigDecimal originalPrice = product.getPrice();

        Promotion promotion = findBestPromotion(product);

        if (promotion == null) {

            return PromotionResult.builder()
                    .promotion(null)
                    .originalPrice(originalPrice)
                    .finalPrice(originalPrice)
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal discount =
                calculateDiscountAmount(
                        promotion,
                        originalPrice
                );

        BigDecimal finalPrice =
                originalPrice.subtract(discount);

        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        return PromotionResult.builder()
                .promotion(promotion)
                .originalPrice(originalPrice)
                .finalPrice(finalPrice)
                .discountAmount(discount)
                .build();
    }

    public Promotion findBestPromotion(Product product) {

        List<Promotion> promotions =
                promotionRepository.findProductPromotions(
                        product.getId()
                );

        // Không có promotion riêng thì lấy promotion toàn shop
        if (promotions.isEmpty()) {

            promotions =
                    promotionRepository.findSellerPromotions(
                            product.getSeller().getId()
                    );

        }

        if (promotions.isEmpty()) {
            return null;
        }

        Promotion bestPromotion = null;

        BigDecimal bestDiscount =
                BigDecimal.ZERO;

        for (Promotion promotion : promotions) {

            BigDecimal discount =
                    calculateDiscountAmount(
                            promotion,
                            product.getPrice()
                    );

            if (discount.compareTo(bestDiscount) > 0) {

                bestDiscount = discount;
                bestPromotion = promotion;

            }
        }

        return bestPromotion;
    }

    private BigDecimal calculateDiscountAmount(
            Promotion promotion,
            BigDecimal price
    ) {

        if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {

            BigDecimal discount =
                    price.multiply(
                            promotion.getDiscountValue()
                                    .divide(BigDecimal.valueOf(100))
                    );

            if (promotion.getMaxDiscountAmount() != null
                    &&
                    discount.compareTo(
                            promotion.getMaxDiscountAmount()
                    ) > 0) {

                discount =
                        promotion.getMaxDiscountAmount();
            }

            return discount;
        }

        return promotion.getDiscountValue();
    }

}
