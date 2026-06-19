package com.example.OneNightProject.auth.service;

import com.example.OneNightProject.auth.dto.request.AuthenticationRequest;
import com.example.OneNightProject.auth.dto.response.AuthenticationResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.IOException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    void verifyAccount(HttpServletResponse response, String token) throws IOException;

    AuthenticationResponse socialLogin(OAuth2User oauth2User, Authentication authentication);
}
