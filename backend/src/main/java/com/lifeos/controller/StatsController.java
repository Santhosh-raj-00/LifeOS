package com.lifeos.controller;

import com.lifeos.dto.StatsResponse;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public ResponseEntity<StatsResponse> getStats(
            @RequestParam(value = "range", defaultValue = "weekly") String range) {
        
        User user = getAuthenticatedUser();
        StatsResponse stats = statsService.getStats(user.getId(), range);
        return ResponseEntity.ok(stats);
    }
}
