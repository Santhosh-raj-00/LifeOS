package com.lifeos.controller;

import com.lifeos.model.Achievement;
import com.lifeos.model.User;
import com.lifeos.repository.AchievementRepository;
import com.lifeos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        User user = getAuthenticatedUser();
        List<Achievement> achievements = achievementRepository.findByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("xp", user.getXp());
        response.put("level", user.getLevel());
        response.put("currentStreak", user.getCurrentStreak());
        response.put("bestStreak", user.getBestStreak());
        response.put("createdAt", user.getCreatedAt());
        response.put("achievements", achievements);

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String name = body.get("name");
            String email = body.get("email");
            String phone = body.get("phone");

            if (!StringUtils.hasText(name)) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            user.setName(name.trim());

            if (StringUtils.hasText(email)) {
                email = email.trim();
                if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                    return ResponseEntity.badRequest().body("Email is already in use");
                }
                user.setEmail(email);
            } else {
                user.setEmail(null);
            }

            if (StringUtils.hasText(phone)) {
                phone = phone.trim();
                if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                    return ResponseEntity.badRequest().body("Phone number is already in use");
                }
                user.setPhone(phone);
            } else {
                user.setPhone(null);
            }

            if (user.getEmail() == null && user.getPhone() == null) {
                return ResponseEntity.badRequest().body("Either Email or Phone Number must be provided");
            }

            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String oldPassword = body.get("oldPassword");
            String newPassword = body.get("newPassword");

            if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
                return ResponseEntity.badRequest().body("Old and new passwords are required");
            }

            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Incorrect old password");
            }

            if (newPassword.length() < 8) {
                return ResponseEntity.badRequest().body("New password must be at least 8 characters");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
