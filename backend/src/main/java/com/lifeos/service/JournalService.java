package com.lifeos.service;

import com.lifeos.model.JournalEntry;
import com.lifeos.model.User;
import com.lifeos.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class JournalService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    public List<JournalEntry> getAllJournalEntries(Long userId) {
        List<JournalEntry> entries = journalEntryRepository.findByUserIdOrderByDateDesc(userId);
        LocalDate today = LocalDate.now();
        // Automatically lock older entries
        for (JournalEntry entry : entries) {
            if (entry.getDate().isBefore(today) && !entry.isLocked()) {
                entry.setLocked(true);
                journalEntryRepository.save(entry);
            }
        }
        return entries;
    }

    public Optional<JournalEntry> getJournalEntry(Long userId, LocalDate date) {
        Optional<JournalEntry> entryOpt = journalEntryRepository.findByUserIdAndDate(userId, date);
        
        // Lock older entries on the fly
        if (entryOpt.isPresent()) {
            JournalEntry entry = entryOpt.get();
            if (date.isBefore(LocalDate.now()) && !entry.isLocked()) {
                entry.setLocked(true);
                return Optional.of(journalEntryRepository.save(entry));
            }
        }
        
        return entryOpt;
    }

    @Transactional
    public JournalEntry saveJournalEntry(Long userId, LocalDate date, JournalEntry updatedEntry, User user) {
        LocalDate today = LocalDate.now();

        if (date.isBefore(today)) {
            throw new IllegalStateException("Journal entry is locked. You cannot edit journals from previous days.");
        }

        if (date.isAfter(today)) {
            throw new IllegalArgumentException("You cannot write a journal entry for future dates.");
        }

        Optional<JournalEntry> existingOpt = journalEntryRepository.findByUserIdAndDate(userId, date);
        JournalEntry entry;

        if (existingOpt.isPresent()) {
            entry = existingOpt.get();
            if (entry.isLocked()) {
                throw new IllegalStateException("Journal is locked.");
            }
            // Update fields
            entry.setContentWhatIDid(updatedEntry.getContentWhatIDid());
            entry.setContentWhatILearned(updatedEntry.getContentWhatILearned());
            entry.setContentWins(updatedEntry.getContentWins());
            entry.setContentMistakes(updatedEntry.getContentMistakes());
            entry.setContentTomorrowGoals(updatedEntry.getContentTomorrowGoals());
        } else {
            entry = JournalEntry.builder()
                    .user(user)
                    .date(date)
                    .contentWhatIDid(updatedEntry.getContentWhatIDid())
                    .contentWhatILearned(updatedEntry.getContentWhatILearned())
                    .contentWins(updatedEntry.getContentWins())
                    .contentMistakes(updatedEntry.getContentMistakes())
                    .contentTomorrowGoals(updatedEntry.getContentTomorrowGoals())
                    .locked(false)
                    .build();
        }

        return journalEntryRepository.save(Objects.requireNonNull(entry));
    }
}
