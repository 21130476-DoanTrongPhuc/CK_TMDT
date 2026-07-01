package com.example.OneNightProject.product.entity;

import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.product.enums.ProductStatus;
import com.example.OneNightProject.review.entity.Review;
import com.example.OneNightProject.user.entity.Users;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price = BigDecimal.valueOf(0);

    @Column(name = "stock", columnDefinition = "Integer default 0", nullable = false)
    private Integer stock = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductStatus status;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "brand_id")
    // private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private Users seller;

    @OneToMany(mappedBy = "product")
    @JsonManagedReference
    private List<CartItem> cartItem;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "productId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    private List<Review> reviews;

    private BigDecimal discountPrice;

    @JoinColumn(name = "allow_customization")
    private Boolean allowCustomization;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deleteAt;
}