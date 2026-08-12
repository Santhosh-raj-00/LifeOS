package com.lifeos.service;

import com.lifeos.dto.StatsResponse;
import com.lifeos.model.*;
import com.lifeos.repository.HabitLogRepository;
import com.lifeos.repository.TaskLogRepository;
import com.lifeos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private TaskLogRepository taskLogRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UserRepository userRepository;

    public StatsResponse getStats(Long userId, String range) {
        LocalDate end = LocalDate.now();
        LocalDate start;

        switch (range.toLowerCase()) {
            case "weekly":
                start = end.minusDays(6);
                break;
            case "monthly":
                start = end.minusDays(29);
                break;
            case "yearly":
                start = end.minusDays(364);
                break;
            case "daily":
            default:
                start = end;
                break;
        }

        // Fetch user streaks
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Fetch task logs in range
        List<TaskLog> taskLogs = taskLogRepository.findByScheduleUserIdAndDateBetween(userId, start, end);
        
        long totalTasks = taskLogs.size();
        long totalCompleted = taskLogs.stream().filter(l -> l.getStatus() == TaskStatus.COMPLETED).count();
        long totalMissed = taskLogs.stream().filter(l -> l.getStatus() == TaskStatus.MISSED).count();

        double completionRate = totalTasks > 0 ? ((double) totalCompleted / totalTasks) * 100.0 : 0.0;
        double missedRate = totalTasks > 0 ? ((double) totalMissed / totalTasks) * 100.0 : 0.0;

        // Group history by date
        Map<LocalDate, List<TaskLog>> logsByDate = taskLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getDate()));

        List<Map<String, Object>> taskHistory = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Iterate over dates in range to generate full list (even days with 0 tasks)
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            List<TaskLog> dateLogs = logsByDate.getOrDefault(date, Collections.emptyList());
            long dateCompleted = dateLogs.stream().filter(l -> l.getStatus() == TaskStatus.COMPLETED).count();
            long dateMissed = dateLogs.stream().filter(l -> l.getStatus() == TaskStatus.MISSED).count();
            long dateTotal = dateLogs.size();

            Map<String, Object> historyPoint = new HashMap<>();
            historyPoint.put("date", date.format(formatter));
            historyPoint.put("completed", dateCompleted);
            historyPoint.put("missed", dateMissed);
            historyPoint.put("total", dateTotal);
            taskHistory.add(historyPoint);
        }

        // Category breakdown
        Map<ScheduleCategory, List<TaskLog>> logsByCategory = taskLogs.stream()
                .collect(Collectors.groupingBy(l -> l.getSchedule().getCategory()));

        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        for (ScheduleCategory category : ScheduleCategory.values()) {
            List<TaskLog> catLogs = logsByCategory.getOrDefault(category, Collections.emptyList());
            if (!catLogs.isEmpty()) {
                long catCompleted = catLogs.stream().filter(l -> l.getStatus() == TaskStatus.COMPLETED).count();
                long catTotal = catLogs.size();

                Map<String, Object> catMap = new HashMap<>();
                catMap.put("category", category.name());
                catMap.put("completed", catCompleted);
                catMap.put("total", catTotal);
                catMap.put("percentage", ((double) catCompleted / catTotal) * 100.0);
                categoryBreakdown.add(catMap);
            }
        }

        // Habit Heatmap: date -> completed habits count
        List<HabitLog> habitLogs = habitLogRepository.findByHabitUserIdAndDateBetween(userId, start, end);
        Map<String, Integer> habitHeatmap = new HashMap<>();
        for (HabitLog habitLog : habitLogs) {
            if (habitLog.getStatus() == HabitLogStatus.COMPLETED) {
                String dateStr = habitLog.getDate().format(formatter);
                habitHeatmap.put(dateStr, habitHeatmap.getOrDefault(dateStr, 0) + 1);
            }
        }

        return StatsResponse.builder()
                .completionRate(completionRate)
                .missedRate(missedRate)
                .currentStreak(user.getCurrentStreak())
                .bestStreak(user.getBestStreak())
                .totalTasks(totalTasks)
                .totalCompleted(totalCompleted)
                .totalMissed(totalMissed)
                .taskHistory(taskHistory)
                .categoryBreakdown(categoryBreakdown)
                .habitHeatmap(habitHeatmap)
                .build();
    }
}
