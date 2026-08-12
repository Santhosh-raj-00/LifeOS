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
import java.util.Objects;

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
        LocalDate today = LocalDate.now();
        int streak = 0;
        int consecutiveEmptyDays = 0;
        LocalDate checkDate = today;
        
        while (true) {
            List<TaskLog> logsForDay = taskLogRepository.findByScheduleUserIdAndDate(user.getId(), checkDate);
            
            if (logsForDay.isEmpty()) {
                if (checkDate.equals(today)) {
                    // Today has no scheduled tasks; skip to yesterday without breaking
                    checkDate = checkDate.minusDays(1);
                    continue;
                } else {
                    consecutiveEmptyDays++;
                    if (consecutiveEmptyDays > 3) {
                        // More than 3 consecutive days without scheduled tasks breaks the streak
                        break;
                    }
                    checkDate = checkDate.minusDays(1);
                    continue;
                }
            }
            
            // Non-empty day resets consecutive empty day count
            consecutiveEmptyDays = 0;

            boolean allCompleted = true;
            boolean hasCompleted = false;
            for (TaskLog log : logsForDay) {
                if (log.getStatus() == TaskStatus.COMPLETED) {
                    hasCompleted = true;
                } else {
                    allCompleted = false;
                }
            }
            
            if (checkDate.equals(today)) {
                if (hasCompleted && allCompleted) {
                    streak++;
                }
                // If today is in progress or not 100% complete, it does not count as a completed day yet, but does not break yesterday's streak.
            } else {
                if (hasCompleted && allCompleted) {
                    streak++;
                } else {
                    // A past day with uncompleted or missed tasks breaks the streak
                    break;
                }
            }
            
            checkDate = checkDate.minusDays(1);
            
            // Safety limit (1 year)
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
        List<TaskLog> logs = taskLogRepository.findByScheduleUserIdAndDateBetween(user.getId(), LocalDate.of(2020, 1, 1), LocalDate.now().plusDays(1));
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
            achievementRepository.save(Objects.requireNonNull(achievement));
            
            // Bonus XP for achievement unlock
            addXp(user, 50);
        }
    }
}
