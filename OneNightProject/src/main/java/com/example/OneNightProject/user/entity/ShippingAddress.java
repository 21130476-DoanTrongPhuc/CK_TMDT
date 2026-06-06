package com.example.OneNightProject.user.entity;

import com.example.OneNightProject.user.entity.Users;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ShippingAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
    @Column(name = "address")
    private String address;
    @Column(name = "receiver_name")
    private String receiverName;
    @Column(name = "receiver_phone")
    private String receiverPhone;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
