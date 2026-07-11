package com.lifeos.controller;

import com.lifeos.model.Habit;
import com.lifeos.model.HabitLog;
import com.lifeos.model.HabitLogStatus;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getHabits() {
        User user = getAuthenticatedUser();
        List<Habit> habits = habitService.getHabitsByUser(user.getId());
        return ResponseEntity.ok(habits);
    }

    @PostMapping
    public ResponseEntity<?> createHabit(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Habit name is required");
        }
        User user = getAuthenticatedUser();
        Habit created = habitService.createHabit(name.trim(), user);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            habitService.deleteHabit(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<HabitLog>> getHabitLogs(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        User user = getAuthenticatedUser();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<HabitLog> logs = habitService.getHabitLogsForDate(user.getId(), targetDate);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/{id}/log")
    public ResponseEntity<?> logHabit(
            @PathVariable Long id,
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("status") HabitLogStatus status) {
        try {
            User user = getAuthenticatedUser();
            LocalDate targetDate = date != null ? date : LocalDate.now();
            HabitLog log = habitService.logHabit(id, targetDate, status, user.getId());
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
