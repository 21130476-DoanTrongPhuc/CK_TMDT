package com.example.OneNightProject.cart.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Table(name = "cart_item_customizations")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CartItemCustomized {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @OneToOne
    @JoinColumn(name = "cart_item_id")
    @JsonBackReference
    private CartItem cartItem;
    @Column(name = "custom_text")
    private String custom_text;
    @Column(name = "custom_note")
    private String custom_note;
    @Column(name = "custom_image")
    private String custom_image;
}
