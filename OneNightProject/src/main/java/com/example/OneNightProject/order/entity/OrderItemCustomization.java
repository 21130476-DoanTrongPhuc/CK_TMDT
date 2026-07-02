package com.example.OneNightProject.order.entity;

import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.product.entity.CustomField;
import com.example.OneNightProject.product.entity.CustomFieldOption;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_item_customizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemCustomization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

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
