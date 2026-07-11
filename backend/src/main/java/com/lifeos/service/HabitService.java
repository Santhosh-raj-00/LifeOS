package com.lifeos.service;

import com.lifeos.model.Habit;
import com.lifeos.model.HabitLog;
import com.lifeos.model.HabitLogStatus;
import com.lifeos.model.User;
import com.lifeos.repository.HabitLogRepository;
import com.lifeos.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private StreakService streakService;

    public Habit createHabit(String name, User user) {
        Habit habit = Habit.builder()
                .name(name)
                .user(user)
                .currentStreak(0)
                .bestStreak(0)
                .build();
        return habitRepository.save(habit);
    }

    public List<Habit> getHabitsByUser(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public void deleteHabit(Long id, Long userId) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        if (!habit.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access");
        }
        habitRepository.delete(habit);
    }

    @Transactional
    public HabitLog logHabit(Long habitId, LocalDate date, HabitLogStatus status, Long userId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access");
        }

        Optional<HabitLog> existingLogOpt = habitLogRepository.findByHabitIdAndDate(habitId, date);
        HabitLog log;

        if (existingLogOpt.isPresent()) {
            log = existingLogOpt.get();
            log.setStatus(status);
        } else {
            log = HabitLog.builder()
                    .habit(habit)
                    .date(date)
                    .status(status)
                    .build();
        }

        log = habitLogRepository.save(log);

        // Recalculate streak for this habit
        recalculateHabitStreak(habit);

        // Award XP if completed
        if (status == HabitLogStatus.COMPLETED) {
            streakService.addXp(habit.getUser(), 5); // +5 XP for habits
        }

        return log;
    }

    public List<HabitLog> getHabitLogsForDate(Long userId, LocalDate date) {
        // Find user habits
        List<Habit> habits = getHabitsByUser(userId);
        
        // Ensure they have a log entry (lazy creation of pending logs for habits)
        for (Habit habit : habits) {
            Optional<HabitLog> logOpt = habitLogRepository.findByHabitIdAndDate(habit.getId(), date);
            if (logOpt.isEmpty()) {
                HabitLogStatus defaultStatus = date.isBefore(LocalDate.now()) ? HabitLogStatus.MISSED : HabitLogStatus.PENDING;
                HabitLog log = HabitLog.builder()
                        .habit(habit)
                        .date(date)
                        .status(defaultStatus)
                        .build();
                habitLogRepository.save(log);
            }
        }
        
        return habitLogRepository.findByHabitUserIdAndDate(userId, date);
    }

    @Transactional
    public void recalculateHabitStreak(Habit habit) {
        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate checkDate = today;

        while (true) {
            Optional<HabitLog> logOpt = habitLogRepository.findByHabitIdAndDate(habit.getId(), checkDate);
            if (logOpt.isPresent()) {
                HabitLogStatus status = logOpt.get().getStatus();
                if (status == HabitLogStatus.COMPLETED) {
                    streak++;
                } else {
                    // For today, pending status doesn't break the streak of yesterday yet.
                    if (checkDate.equals(today)) {
                        // Keep going, don't increment, don't break
                    } else {
                        break;
                    }
                }
            } else {
                // If it is today and no log is created yet, continue checking yesterday
                if (checkDate.equals(today)) {
                    // Continue checking yesterday
                } else {
                    break;
                }
            }
            checkDate = checkDate.minusDays(1);
            
            // Loop safety (1 year)
            if (checkDate.isBefore(today.minusDays(366))) {
                break;
            }
        }

        habit.setCurrentStreak(streak);
        if (streak > habit.getBestStreak()) {
            habit.setBestStreak(streak);
        }
        habitRepository.save(habit);
    }

    public double calculateSuccessPercentage(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findAll().stream()
                .filter(l -> l.getHabit().getId().equals(habitId))
                .toList();

        if (logs.isEmpty()) {
            return 0.0;
        }

        long completedCount = logs.stream()
                .filter(l -> l.getStatus() == HabitLogStatus.COMPLETED)
                .count();

        return ((double) completedCount / logs.size()) * 100.0;
    }
}
