package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.entity.ProductView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductViewRepository
        extends JpaRepository<ProductView, Long> {

    Long countByProductId(Long productId);

    @Query("""
        SELECT p
        FROM ProductView pv
        JOIN pv.product p
        WHERE pv.viewedAt >= :fromDate
        GROUP BY p.id
        ORDER BY COUNT(pv.id) DESC
    """)
    List<Product> findTrendingProducts(
            @Param("fromDate") LocalDateTime fromDate,
            Pageable pageable
    );

    ProductView findByUser_IdAndProduct_Id(Long userId, Long productId);

    boolean existsByUser_IdAndProduct_Id(Long userId, Long productId);
}
