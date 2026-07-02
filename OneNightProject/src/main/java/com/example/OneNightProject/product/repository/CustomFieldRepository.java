package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.entity.CustomField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomFieldRepository extends JpaRepository<CustomField, Long> {

    @Query("""
        select max(c.sortOrder)
        from CustomField c
        where c.product.id = :productId
        """)
    Integer findMaxSortOrder(Long productId);

    Optional<CustomField> findByIdAndProductSellerId(Long id, Long productSellerId);

    List<CustomField> findByProductIdOrderBySortOrder(Long productId);

    List<CustomField> findByProductId(Long productId);
}
