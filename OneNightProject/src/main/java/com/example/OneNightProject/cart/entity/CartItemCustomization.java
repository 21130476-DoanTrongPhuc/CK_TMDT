package com.example.OneNightProject.cart.entity;


import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_item_customizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemCustomization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_item_id")
    private CartItem cartItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id")
    private CustomField field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private CustomFieldOption option;

    @Column(name = "text_value", columnDefinition = "TEXT")
    private String textValue;

    @Column(name = "extra_price")
    private BigDecimal extraPrice;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}