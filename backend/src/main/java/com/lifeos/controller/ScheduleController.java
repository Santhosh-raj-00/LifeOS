package com.lifeos.controller;

import com.lifeos.model.Schedule;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody Schedule schedule) {
        try {
            User user = getAuthenticatedUser();
            Schedule created = scheduleService.createSchedule(schedule, user);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getSchedules() {
        User user = getAuthenticatedUser();
        List<Schedule> schedules = scheduleService.getSchedulesByUser(user.getId());
        return ResponseEntity.ok(schedules);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            scheduleService.deleteSchedule(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
