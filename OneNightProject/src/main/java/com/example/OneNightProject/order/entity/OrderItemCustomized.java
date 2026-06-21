package com.example.OneNightProject.order.entity;

import com.example.OneNightProject.cart.entity.CartItem;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Table(name = "order_item_customizations")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderItemCustomized {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @OneToOne
    @JoinColumn(name = "order_item_id")
    @JsonBackReference
    private OrderItem orderItem;
    @Column(name = "custom_text")
    private String custom_text;
    @Column(name = "custom_note")
    private String custom_note;
    @Column(name = "custom_image")
    private String custom_image;
}
