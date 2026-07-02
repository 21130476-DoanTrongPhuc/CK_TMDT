package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.entity.CustomFieldOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomFieldOptionRepository
        extends JpaRepository<CustomFieldOption, Long> {

    List<CustomFieldOption> findByFieldIdOrderBySortOrder(
            Long fieldId
    );

    Optional<CustomFieldOption> findByIdAndFieldProductSellerId(
            Long optionId,
            Long sellerId
    );

    @Query("""
        select max(o.sortOrder)
        
        from CustomFieldOption o
        
        where o.field.id=:fieldId
    """)
    Integer findMaxSortOrder(Long fieldId);

    Optional<CustomFieldOption> findByIdAndFieldId(
            Long optionId,
            Long fieldId
    );
}
