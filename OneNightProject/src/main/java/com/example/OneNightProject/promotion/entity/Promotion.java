package com.example.OneNightProject.promotion.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.promotion.enums.ApplyType;
import com.example.OneNightProject.promotion.enums.DiscountType;
import com.example.OneNightProject.user.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private Integer usedCount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean active;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplyType applyType;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private Users seller;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
