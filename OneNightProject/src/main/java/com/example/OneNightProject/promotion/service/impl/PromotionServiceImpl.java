package com.example.OneNightProject.promotion.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.promotion.dto.request.PromotionRequest;
import com.example.OneNightProject.promotion.dto.response.PromotionResponse;
import com.example.OneNightProject.promotion.entity.Promotion;
import com.example.OneNightProject.promotion.enums.DiscountType;
import com.example.OneNightProject.promotion.repository.PromotionRepository;
import com.example.OneNightProject.promotion.service.PromotionService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;

    @Override
    public PromotionResponse create(String authHeader, PromotionRequest request) {

        Users seller = getCurrentSeller(authHeader);

        validateRequest(request);

        String code = normalizeCode(request.getCode());

        if (promotionRepository.existsBySeller_IdAndCode(seller.getId(), code)) {
            throw new RuntimeException("Promotion code already exists");
        }

        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .code(code)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(defaultZero(request.getMinOrderValue()))
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive() == null || request.getActive())
                .seller(seller)
                .product(resolveSellerProduct(seller, request.getProductId()))
                .build();

        return toResponse(promotionRepository.save(promotion));
    }

    @Override
    public Page<PromotionResponse> getMyPromotions(String authHeader, Pageable pageable) {

        Users seller = getCurrentSeller(authHeader);

        return promotionRepository
                .findBySeller_Id(seller.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    public PromotionResponse getById(String authHeader, Long id) {

        Users seller = getCurrentSeller(authHeader);

        return toResponse(getPromotionOfSeller(id, seller));
    }

    @Override
    public PromotionResponse update(String authHeader, Long id, PromotionRequest request) {

        Users seller = getCurrentSeller(authHeader);

        Promotion promotion = getPromotionOfSeller(id, seller);

        validateRequest(request);

        String code = normalizeCode(request.getCode());

        if (promotionRepository.existsBySeller_IdAndCodeAndIdNot(seller.getId(), code, id)) {
            throw new RuntimeException("Promotion code already exists");
        }

        promotion.setName(request.getName());
        promotion.setCode(code);
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(defaultZero(request.getMinOrderValue()));
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setActive(request.getActive() == null || request.getActive());
        promotion.setProduct(resolveSellerProduct(seller, request.getProductId()));

        return toResponse(promotionRepository.save(promotion));
    }

    @Override
    public PromotionResponse changeActive(String authHeader, Long id, Boolean active) {

        Users seller = getCurrentSeller(authHeader);

        Promotion promotion = getPromotionOfSeller(id, seller);

        promotion.setActive(active != null && active);

        return toResponse(promotionRepository.save(promotion));
    }

    @Override
    public void delete(String authHeader, Long id) {

        Users seller = getCurrentSeller(authHeader);

        Promotion promotion = getPromotionOfSeller(id, seller);

        promotion.setActive(false);

        promotionRepository.save(promotion);
    }

    public Promotion findActivePromotionForSeller(Long sellerId, String code) {
        if (sellerId == null) {
            throw new RuntimeException("Seller id is required");
        }
        if (code == null || code.isBlank()) {
            throw new RuntimeException("Promotion code is required");
        }

        return promotionRepository
                .findBySeller_IdAndCodeAndActiveTrue(sellerId, normalizeCode(code))
                .orElseThrow(() -> new RuntimeException("Promotion not found for this seller"));
    }

    private Users getCurrentSeller(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is invalid");
        }

        String token = authHeader.substring(7);

        Users user = customerRepository.findByEmail(
                jwtService.extractUsername(token)
        );

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (user.getRole() != CustomerEnum.SELLER) {
            throw new RuntimeException("Only seller can manage promotions");
        }

        return user;
    }

    private Promotion getPromotionOfSeller(Long id, Users seller) {

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        if (!promotion.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You can only manage your own promotion");
        }

        return promotion;
    }

    private Product resolveSellerProduct(Users seller, Long productId) {

        if (productId == null) {
            return null;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getSeller() == null ||
                !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You can only create promotion for your own product");
        }

        return product;
    }

    private void validateRequest(PromotionRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Promotion name is required");
        }

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Promotion code is required");
        }

        if (request.getDiscountType() == null) {
            throw new RuntimeException("Discount type is required");
        }

        if (request.getDiscountValue() == null ||
                request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Discount value must be greater than 0");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE &&
                request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percentage discount cannot be greater than 100");
        }

        if (request.getMinOrderValue() != null &&
                request.getMinOrderValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Minimum order value cannot be negative");
        }

        if (request.getMaxDiscountAmount() != null &&
                request.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Maximum discount amount must be greater than 0");
        }

        if (request.getUsageLimit() != null && request.getUsageLimit() <= 0) {
            throw new RuntimeException("Usage limit must be greater than 0");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }
    }

    private PromotionResponse toResponse(Promotion promotion) {

        Product product = promotion.getProduct();
        Users seller = promotion.getSeller();

        return PromotionResponse.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .code(promotion.getCode())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .minOrderValue(promotion.getMinOrderValue())
                .maxDiscountAmount(promotion.getMaxDiscountAmount())
                .usageLimit(promotion.getUsageLimit())
                .usedCount(promotion.getUsedCount())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .active(promotion.getActive())
                .sellerId(seller == null ? null : seller.getId())
                .sellerName(seller == null ? null : seller.getFullName())
                .productId(product == null ? null : product.getId())
                .productName(product == null ? null : product.getName())
                .build();
    }

    private String normalizeCode(String code) {

        return code.trim().toUpperCase();
    }

    private BigDecimal defaultZero(BigDecimal value) {

        return value == null ? BigDecimal.ZERO : value;
    }
}
