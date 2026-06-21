package com.example.OneNightProject.order.entity;

import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.payment.entity.Payment;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import com.example.OneNightProject.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    // ==========================
    // Customer
    // ==========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    // ==========================
    // Price
    // ==========================
    @Column(name = "total_price", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    // ==========================
    // Order Status
    // ==========================

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // ==========================
    // Payment
    // ==========================
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatusOrder paymentStatus;

    @Column(name = "paid_amount", precision = 18, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "remaining_amount", precision = 18, scale = 2)
    private BigDecimal remainingAmount;

    // ==========================
    // Shipping Info
    // ==========================
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    // ==========================
    // Audit
    // ==========================
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==========================
    // Relationships
    // ==========================

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItem> orderItems;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL
    )
    private List<Payment> payments;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL
    )
    private List<OrderStatusHistory> statusHistories;

    // ==========================
    // Lifecycle
    // ==========================

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (paymentStatus == null) {
            paymentStatus = PaymentStatusOrder.UNPAID;
        }

        if (paidAmount == null) {
            paidAmount = BigDecimal.ZERO;
        }

        if (remainingAmount == null) {
            remainingAmount = totalPrice;
        }
    }

    public void addOrderItem(OrderItem item) {

        if (orderItems == null) {
            orderItems = new ArrayList<>();
        }

        orderItems.add(item);

        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {

        orderItems.remove(item);

        item.setOrder(null);
    }



    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}