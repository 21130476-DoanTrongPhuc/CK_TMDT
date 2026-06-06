package com.example.OneNightProject.auth.entity;

import com.example.OneNightProject.auth.enums.ProviderEnum;
import com.example.OneNightProject.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@Entity
@Builder
@Table(name = "oauth_accounts")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OauthAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id")
    private Users userId;
    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private ProviderEnum provider;
    @Column(name = "provider_user_id")
    private String providerId;
}
