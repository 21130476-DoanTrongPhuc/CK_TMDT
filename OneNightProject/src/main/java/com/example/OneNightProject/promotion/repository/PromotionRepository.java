package com.example.OneNightProject.promotion.repository;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.promotion.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Page<Promotion> findBySeller_Id(Long sellerId, Pageable pageable);

    boolean existsBySeller_IdAndCode(Long sellerId, String code);

    boolean existsBySeller_IdAndCodeAndIdNot(Long sellerId, String code, Long id);

    Optional<Promotion> findBySeller_IdAndCodeAndActiveTrue(Long sellerId, String code);

    Optional<Promotion> findByCodeAndActiveTrue(String code);

    @Query("""
    SELECT p
    FROM Promotion p
    WHERE p.product.id = :productId
      AND p.active = true
      AND CURRENT_TIMESTAMP BETWEEN p.startDate AND p.endDate
""")
    Promotion findActivePromotionByProduct(
            @Param("productId") Long productId
    );
}
