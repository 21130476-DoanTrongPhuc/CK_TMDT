package com.example.OneNightProject.auth.service;

import com.example.OneNightProject.auth.dto.request.AuthenticationRequest;
import com.example.OneNightProject.auth.dto.response.AuthenticationResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    String verifyAccount(String token);

    AuthenticationResponse socialLogin(OAuth2User oauth2User, Authentication authentication);
}
