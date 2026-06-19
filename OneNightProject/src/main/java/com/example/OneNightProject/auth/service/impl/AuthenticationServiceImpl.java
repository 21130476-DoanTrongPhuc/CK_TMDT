package com.example.OneNightProject.auth.service.impl;

import com.example.OneNightProject.auth.dto.request.AuthenticationRequest;
import com.example.OneNightProject.auth.dto.response.AuthenticationResponse;
import com.example.OneNightProject.auth.entity.OauthAccount;
import com.example.OneNightProject.auth.enums.ProviderEnum;
import com.example.OneNightProject.auth.repository.OauthAccountRepository;
import com.example.OneNightProject.auth.service.AuthenticationService;
import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.entity.VerificationToken;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import com.example.OneNightProject.user.repository.CustomerRepository;
import com.example.OneNightProject.user.repository.VerificationTokenRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CustomerRepository customerRepository;
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private OauthAccountRepository oauthAccountRepository;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        Users users = customerRepository.findByEmail(request.getEmail());

        if (users == null) {
            throw new RuntimeException("Email does not exist");
        }

        if (users.getStatus() == CustomerStatusEnum.INACTIVE) {
            throw new RuntimeException("Tài khoản chưa xác nhận email");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            return new AuthenticationResponse(
                    jwtService.generateToken(
                            userDetailsService.loadUserByUsername(request.getEmail())
                    )
            );

        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    @Override
    public void verifyAccount(HttpServletResponse response, String token) throws IOException {
        VerificationToken verificationToken =
                tokenRepository.findByToken(token);

        if (verificationToken == null) {
            return;
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return;
        }

        Users user = verificationToken.getUser();
        user.setStatus(CustomerStatusEnum.ACTIVE);

        customerRepository.save(user);

        response.sendRedirect("/home-fashion-store-v1.html");
    }

    @Override
    public AuthenticationResponse socialLogin(OAuth2User oauth2User, Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new RuntimeException("Invalid authentication");
        }

        // google hoặc facebook
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        String providerId;
        String email;
        String name;

        if(provider.equals("google")) {
            providerId = oauth2User.getAttribute("sub");
            email = oauth2User.getAttribute("email");
            name = oauth2User.getAttribute("name");

            if(customerRepository.existsByEmail(email)){
                return new AuthenticationResponse(jwtService.generateToken(userDetailsService.loadUserByUsername(email)));
            }else{
                Users users = Users.builder()
                        .email(email)
                        .role(CustomerEnum.USER)
                        .status(CustomerStatusEnum.ACTIVE)
                        .build();
                customerRepository.save(users);

                OauthAccount oauthAccount = OauthAccount.builder()
                        .userId(users)
                        .provider(ProviderEnum.GOOGLE)
                        .providerId(providerId)
                        .build();
                oauthAccountRepository.save(oauthAccount);

                return new AuthenticationResponse(jwtService.generateToken(userDetailsService.loadUserByUsername(email)));
            }
        }
        else if(provider.equals("facebook")) {
            providerId = oauth2User.getAttribute("id");
            email = oauth2User.getAttribute("email");
            name = oauth2User.getAttribute("name");

            if(customerRepository.existsByEmail(email)){
                return new AuthenticationResponse(jwtService.generateToken(userDetailsService.loadUserByUsername(email)));
            }else{
                Users users = Users.builder()
                        .email(email)
                        .role(CustomerEnum.USER)
                        .status(CustomerStatusEnum.ACTIVE)
                        .build();

                customerRepository.save(users);

                OauthAccount oauthAccount = OauthAccount.builder()
                        .userId(users)
                        .provider(ProviderEnum.FACEBOOK)
                        .providerId(providerId)
                        .build();
                oauthAccountRepository.save(oauthAccount);

                return new AuthenticationResponse(jwtService.generateToken(userDetailsService.loadUserByUsername(email)));
            }
        }
        else {
            throw new RuntimeException("Unsupported provider");
        }
    }
}
