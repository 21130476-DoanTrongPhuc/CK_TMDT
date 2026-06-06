package com.example.OneNightProject.review.entity;

import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.review.enums.ReviewStatus;
import com.example.OneNightProject.user.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;
}
