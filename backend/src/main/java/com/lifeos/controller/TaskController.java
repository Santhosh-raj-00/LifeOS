package com.lifeos.controller;

import com.lifeos.model.TaskLog;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public ResponseEntity<List<TaskLog>> getTasks(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        User user = getAuthenticatedUser();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<TaskLog> tasks = taskService.getTasksForDate(user.getId(), targetDate);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            TaskLog completed = taskService.completeTask(id, user.getId());
            return ResponseEntity.ok(completed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
