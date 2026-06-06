package com.example.OneNightProject.user.entity;

import com.example.OneNightProject.auth.entity.OauthAccount;
import com.example.OneNightProject.auth.enums.UserEnum;
import com.example.OneNightProject.auth.enums.UserStatusEnum;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "email")
    private String email;
    @Column(name = "password")
    private String password;
    @Column(name = "full_name")
    private String fullName;
    @Column(name = "phone")
    private String phone;
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private CustomerEnum role;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CustomerStatusEnum status;
    @OneToOne(
            mappedBy = "userId",
            cascade = CascadeType.ALL
    )
    private OauthAccount oauthAccountId;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private UserProfile userProfile;

    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonManagedReference
    private List<ShippingAddress> addressList = new ArrayList<>();

    // Helper method để đồng bộ cả 2 chiều
    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
        userProfile.setUser(this);
    }
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void addAddress(
            ShippingAddress shippingAddress
    ) {
        this.addressList.add(shippingAddress);
        shippingAddress.setUser(this);
    }
}
