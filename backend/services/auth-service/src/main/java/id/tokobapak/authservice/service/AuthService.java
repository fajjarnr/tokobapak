package id.tokobapak.authservice.service;

import id.tokobapak.authservice.config.JwtConfig;
import id.tokobapak.authservice.domain.User;
import id.tokobapak.authservice.dto.*;
import id.tokobapak.authservice.exception.InvalidCredentialsException;
import id.tokobapak.authservice.exception.InvalidTokenException;
import id.tokobapak.authservice.repository.UserRepository;
import id.tokobapak.authservice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final JwtConfig jwtConfig;

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();

            String accessToken = jwtTokenProvider.generateAccessToken(user, user.getId());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user, user.getId());

            log.info("Login successful for user: {}", user.getId());

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtConfig.getAccessTokenExpiration() / 1000)
                    .user(LoginResponse.UserInfo.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .name(user.getName())
                            .role(user.getRole().name())
                            .avatarUrl(user.getAvatarUrl())
                            .build())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        String tokenType = jwtTokenProvider.extractTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new InvalidTokenException("Token is not a refresh token");
        }

        String email = jwtTokenProvider.extractUsername(refreshToken);
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user, user.getId());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user, user.getId());

        log.info("Token refreshed for user: {}", user.getId());

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtConfig.getAccessTokenExpiration() / 1000)
                .build();
    }

    public ValidateTokenResponse validateToken(String token) {
        try {
            if (!jwtTokenProvider.validateToken(token)) {
                return ValidateTokenResponse.builder()
                        .valid(false)
                        .build();
            }

            String email = jwtTokenProvider.extractUsername(token);
            User user = userRepository.findByEmailAndIsActiveTrue(email)
                    .orElse(null);

            if (user == null) {
                return ValidateTokenResponse.builder()
                        .valid(false)
                        .build();
            }

            return ValidateTokenResponse.builder()
                    .valid(true)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return ValidateTokenResponse.builder()
                    .valid(false)
                    .build();
        }
    }
}
