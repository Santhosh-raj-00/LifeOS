package com.lifeos.controller;

import com.lifeos.model.JournalEntry;
import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;
import com.lifeos.service.JournalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/journals")
public class JournalController {

    @Autowired
    private JournalService journalService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping("/all")
    public ResponseEntity<List<JournalEntry>> getAllJournals() {
        User user = getAuthenticatedUser();
        List<JournalEntry> entries = journalService.getAllJournalEntries(user.getId());
        return ResponseEntity.ok(entries);
    }

    @GetMapping
    public ResponseEntity<JournalEntry> getJournal(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        User user = getAuthenticatedUser();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        Optional<JournalEntry> journal = journalService.getJournalEntry(user.getId(), targetDate);
        
        return journal.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(JournalEntry.builder()
                        .date(targetDate)
                        .contentWhatIDid("")
                        .contentWhatILearned("")
                        .contentWins("")
                        .contentMistakes("")
                        .contentTomorrowGoals("")
                        .locked(targetDate.isBefore(LocalDate.now()))
                        .build()));
    }

    @PostMapping
    public ResponseEntity<?> saveJournal(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody JournalEntry entry) {
        try {
            User user = getAuthenticatedUser();
            LocalDate targetDate = date != null ? date : LocalDate.now();
            JournalEntry saved = journalService.saveJournalEntry(user.getId(), targetDate, entry, user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
