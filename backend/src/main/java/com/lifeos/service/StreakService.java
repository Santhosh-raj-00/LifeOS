package com.lifeos.service;

import com.lifeos.model.Achievement;
import com.lifeos.model.TaskLog;
import com.lifeos.model.TaskStatus;
import com.lifeos.model.User;
import com.lifeos.repository.AchievementRepository;
import com.lifeos.repository.TaskLogRepository;
import com.lifeos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StreakService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private TaskLogRepository taskLogRepository;

    @Transactional
    public void handleTaskCompletion(User user) {
        // Award XP
        addXp(user, 10);

        // Check total completed tasks
        checkTaskCountAchievements(user);

        // Recalculate streak
        recalculateAndSaveStreak(user);
    }

    @Transactional
    public void addXp(User user, int xpAmount) {
        user.setXp(user.getXp() + xpAmount);
        int oldLevel = user.getLevel();
        int newLevel = oldLevel;

        if (user.getXp() >= 2000) {
            newLevel = 4;
        } else if (user.getXp() >= 500) {
            newLevel = 3;
        } else if (user.getXp() >= 100) {
            newLevel = 2;
        } else {
            newLevel = 1;
        }

        if (newLevel > oldLevel) {
            user.setLevel(newLevel);
        }
        userRepository.save(user);
    }

    @Transactional
    public void recalculateAndSaveStreak(User user) {
        // Let's analyze logs grouped by date
        // Find date range
        LocalDate today = LocalDate.now();
        int streak = 0;
        
        // We will traverse backwards starting from today/yesterday
        LocalDate checkDate = today;
        
        // If today has any missed tasks, streak is reset for today (it can still be evaluated starting yesterday)
        // Let's check yesterday first. If yesterday was a success, check the day before, etc.
        // What is a successful day? A day where:
        // 1. There is at least 1 task log
        // 2. All task logs are COMPLETED (0 PENDING, 0 MISSED, 0 LOCKED with status MISSED)
        
        // Let's implement a simple date iteration:
        checkDate = today;
        
        // We will fetch task logs for specific days backwards
        while (true) {
            List<TaskLog> logsForDay = taskLogRepository.findByScheduleUserIdAndDate(user.getId(), checkDate);
            if (logsForDay.isEmpty()) {
                // If it is today and they haven't scheduled anything, skip and look at yesterday
                if (checkDate.equals(today)) {
                    checkDate = checkDate.minusDays(1);
                    continue;
                } else {
                    // No tasks scheduled in a past day doesn't break the streak unless they skipped many days.
                    // But to be simple and standard: if we find a gap with zero tasks, we stop if it is past yesterday.
                    if (checkDate.isBefore(today.minusDays(3))) {
                        // Allow up to 3 days of gap (rest days) without breaking the streak
                        checkDate = checkDate.minusDays(1);
                        continue;
                    } else {
                        break;
                    }
                }
            }
            
            boolean allCompleted = true;
            boolean hasCompleted = false;
            for (TaskLog log : logsForDay) {
                if (log.getStatus() == TaskStatus.COMPLETED) {
                    hasCompleted = true;
                } else {
                    // If it is today, PENDING doesn't break the streak yet, but it means today is not yet "100% completed"
                    if (checkDate.equals(today)) {
                        allCompleted = false;
                    } else {
                        // If it's a past day, PENDING or MISSED breaks it
                        allCompleted = false;
                    }
                }
            }
            
            if (checkDate.equals(today)) {
                if (hasCompleted && allCompleted) {
                    streak++;
                } else {
                    // Today is still in progress, so it doesn't break the streak of yesterday. We don't increment, but we keep going.
                }
            } else {
                if (hasCompleted && allCompleted) {
                    streak++;
                } else {
                    // Yesterday or a past day was not completed -> streak breaks
                    break;
                }
            }
            
            checkDate = checkDate.minusDays(1);
            
            // Limit loop safety
            if (checkDate.isBefore(today.minusDays(366))) {
                break;
            }
        }
        
        user.setCurrentStreak(streak);
        if (streak > user.getBestStreak()) {
            user.setBestStreak(streak);
        }
        
        userRepository.save(user);
        
        // Check streak achievements
        checkStreakAchievements(user, streak);
    }

    private void checkStreakAchievements(User user, int streak) {
        if (streak >= 7) {
            unlockAchievement(user, "7-Day Streak", "Maintained a perfect completion streak for 7 consecutive days.");
        }
        if (streak >= 30) {
            unlockAchievement(user, "30-Day Streak", "Maintained a perfect completion streak for 30 consecutive days.");
        }
        if (streak >= 365) {
            unlockAchievement(user, "365-Day Discipline Streak", "Ultimate Legend! A perfect completion streak for 365 days.");
        }
    }

    private void checkTaskCountAchievements(User user) {
        // Get total completed tasks
        List<TaskLog> logs = taskLogRepository.findByScheduleUserIdAndDateBetween(user.getId(), LocalDate.now().minusYears(5), LocalDate.now().plusDays(1));
        long completedCount = logs.stream()
                .filter(l -> l.getStatus() == TaskStatus.COMPLETED)
                .count();

        if (completedCount >= 100) {
            unlockAchievement(user, "100 Tasks Completed", "Successfully completed 100 accountability tasks.");
        }
    }

    private void unlockAchievement(User user, String title, String description) {
        if (!achievementRepository.existsByUserIdAndTitle(user.getId(), title)) {
            Achievement achievement = Achievement.builder()
                    .user(user)
                    .title(title)
                    .description(description)
                    .unlockedAt(LocalDateTime.now())
                    .build();
            achievementRepository.save(achievement);
            
            // Bonus XP for achievement unlock
            addXp(user, 50);
        }
    }
}
