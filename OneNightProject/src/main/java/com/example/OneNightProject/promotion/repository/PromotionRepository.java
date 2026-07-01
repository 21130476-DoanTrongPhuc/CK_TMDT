package com.example.OneNightProject.promotion.repository;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.promotion.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Page<Promotion> findBySeller_Id(Long sellerId, Pageable pageable);

    boolean existsBySeller_IdAndCode(Long sellerId, String code);

    boolean existsBySeller_IdAndCodeAndIdNot(Long sellerId, String code, Long id);

    Optional<Promotion> findBySeller_IdAndCodeAndActiveTrue(Long sellerId, String code);

    Optional<Promotion> findByCodeAndActiveTrue(String code);

    /**
     * Lấy tất cả promotion có thể áp dụng cho sản phẩm
     */
    @Query("""
        SELECT p
        FROM Promotion p
        WHERE p.active = true
        AND p.applyType = PRODUCT
        AND CURRENT_TIMESTAMP BETWEEN p.startDate AND p.endDate
        AND p.seller.id = :sellerId
        AND (
                p.product.id = :productId
                OR
                p.product IS NULL
        )
    """)
    List<Promotion> findAvailablePromotion(
            @Param("sellerId") Long sellerId,
            @Param("productId") Long productId
    );

    @Query("""
    SELECT p
    FROM Promotion p
    WHERE p.active = true
      AND p.applyType = com.example.OneNightProject.promotion.enums.ApplyType.PRODUCT
      AND p.product.id = :productId
      AND p.startDate <= CURRENT_TIMESTAMP
      AND p.endDate >= CURRENT_TIMESTAMP
""")
    List<Promotion> findProductPromotions(Long productId);


    @Query("""
    SELECT p
    FROM Promotion p
    WHERE p.active = true
      AND p.applyType = com.example.OneNightProject.promotion.enums.ApplyType.PRODUCT
      AND p.product IS NULL
      AND p.seller.id = :sellerId
      AND p.startDate <= CURRENT_TIMESTAMP
      AND p.endDate >= CURRENT_TIMESTAMP
""")
    List<Promotion> findSellerPromotions(Long sellerId);
}
