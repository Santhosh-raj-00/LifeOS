package com.lifeos.service;

import com.lifeos.dto.AuthResponse;
import com.lifeos.dto.LoginRequest;
import com.lifeos.dto.RegisterRequest;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public User register(RegisterRequest request) {
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Full Name is required");
        }
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getPhone())) {
            throw new IllegalArgumentException("Either Email or Phone Number must be provided");
        }
        if (StringUtils.hasText(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (StringUtils.hasText(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number is already in use");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = User.builder()
                .name(request.getName())
                .email(StringUtils.hasText(request.getEmail()) ? request.getEmail().trim() : null)
                .phone(StringUtils.hasText(request.getPhone()) ? request.getPhone().trim() : null)
                .password(passwordEncoder.encode(request.getPassword()))
                .xp(0)
                .level(1)
                .currentStreak(0)
                .bestStreak(0)
                .lastActiveDate(LocalDate.now())
                .build();

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        if (!StringUtils.hasText(request.getUsername())) {
            throw new IllegalArgumentException("Email or Phone Number is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Password is required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getUsername())
                .or(() -> userRepository.findByPhone(request.getUsername()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update last active date to today on login
        user.setLastActiveDate(LocalDate.now());
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .level(user.getLevel())
                .xp(user.getXp())
                .currentStreak(user.getCurrentStreak())
                .bestStreak(user.getBestStreak())
                .build();
    }
}
