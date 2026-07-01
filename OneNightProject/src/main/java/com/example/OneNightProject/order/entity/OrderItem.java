package com.example.OneNightProject.order.entity;

import com.example.OneNightProject.cart.entity.CartItemCustomized;
import com.example.OneNightProject.product.entity.Product;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@Entity
@Table(name = "order_items")
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product productId;
    @Column(name = "quantity")
    private Integer quantity;
    @Column(name = "price", nullable = false)
    private BigDecimal price = BigDecimal.valueOf(0);
    @Column(name = "is_customized")
    private boolean isCustomized;
    @Column(name = "customization_price")
    private BigDecimal priceCustomProduct = BigDecimal.valueOf(0);
    @OneToOne(
            mappedBy = "orderItem",
            cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private OrderItemCustomized customization;

    private BigDecimal originalPrice;

    private BigDecimal discountPrice;

    private BigDecimal discountAmount;

    private Long promotionId;

    private String promotionName;


}
