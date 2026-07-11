package com.lifeos.service;

import com.lifeos.model.*;
import com.lifeos.repository.TaskLogRepository;
import com.lifeos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskLogRepository taskLogRepository;

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private StreakService streakService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public List<TaskLog> getTasksForDate(Long userId, LocalDate date) {
        // 1. Get all active schedules for the user on this date
        List<Schedule> activeSchedules = scheduleService.getActiveSchedulesForDate(userId, date);
        List<TaskLog> taskLogs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        for (Schedule schedule : activeSchedules) {
            Optional<TaskLog> existingLogOpt = taskLogRepository.findByScheduleIdAndDate(schedule.getId(), date);
            TaskLog log;
            
            if (existingLogOpt.isPresent()) {
                log = existingLogOpt.get();
                // If it is PENDING and the end time has passed, update it to MISSED
                if (log.getStatus() == TaskStatus.PENDING) {
                    boolean isPastEndTime = false;
                    if (date.isBefore(today)) {
                        isPastEndTime = true;
                    } else if (date.equals(today) && now.isAfter(schedule.getEndTime())) {
                        isPastEndTime = true;
                    }

                    if (isPastEndTime) {
                        log.setStatus(TaskStatus.MISSED);
                        log.setLocked(true);
                        log.setMissedAt(LocalDateTime.of(date, schedule.getEndTime()));
                        log = taskLogRepository.save(log);
                    }
                }
            } else {
                // Determine initial status based on date/time window
                TaskStatus initialStatus = TaskStatus.PENDING;
                boolean locked = false;
                LocalDateTime missedAt = null;

                if (date.isBefore(today)) {
                    initialStatus = TaskStatus.MISSED;
                    locked = true;
                    missedAt = LocalDateTime.of(date, schedule.getEndTime());
                } else if (date.equals(today)) {
                    if (now.isAfter(schedule.getEndTime())) {
                        initialStatus = TaskStatus.MISSED;
                        locked = true;
                        missedAt = LocalDateTime.of(date, schedule.getEndTime());
                    }
                }

                log = TaskLog.builder()
                        .schedule(schedule)
                        .date(date)
                        .status(initialStatus)
                        .locked(locked)
                        .missedAt(missedAt)
                        .build();
                
                log = taskLogRepository.save(log);
            }
            taskLogs.add(log);
        }

        // Sort task logs by start time chronologically
        taskLogs.sort(Comparator.comparing(l -> l.getSchedule().getStartTime()));
        return taskLogs;
    }

    @Transactional
    public TaskLog completeTask(Long taskLogId, Long userId) {
        TaskLog log = taskLogRepository.findById(taskLogId)
                .orElseThrow(() -> new IllegalArgumentException("Task log not found"));

        if (!log.getSchedule().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized task access");
        }

        if (log.isLocked()) {
            throw new IllegalStateException("Task is locked and cannot be modified");
        }

        if (log.getStatus() == TaskStatus.COMPLETED) {
            throw new IllegalStateException("Task is already completed");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Verification rules
        if (!log.getDate().equals(today)) {
            throw new IllegalStateException("You can only complete tasks scheduled for today");
        }

        LocalTime startTime = log.getSchedule().getStartTime();
        LocalTime endTime = log.getSchedule().getEndTime();

        if (now.isBefore(startTime)) {
            throw new IllegalStateException("Time window has not started yet. Schedule window is " + startTime + " to " + endTime);
        }

        if (now.isAfter(endTime)) {
            // Should be auto-locked but checking just in case
            log.setStatus(TaskStatus.MISSED);
            log.setLocked(true);
            log.setMissedAt(LocalDateTime.of(today, endTime));
            taskLogRepository.save(log);
            throw new IllegalStateException("Time window has expired. Task is now MISSED and locked");
        }

        // If within window, mark complete!
        log.setStatus(TaskStatus.COMPLETED);
        log.setCompletedAt(LocalDateTime.now());
        
        // Locked after end time, but can we lock immediately upon completion?
        // "Completed task: Cannot be changed after end time."
        // So we don't set locked = true immediately, but we prevent toggle-off or change after end time.
        // Actually, to make it secure, if they complete it, we allow it to stay completed. If they try to undo it,
        // we can allow undo ONLY if they are still within the time window.
        // Let's implement that: locked is set to true once end time has passed.
        
        log = taskLogRepository.save(log);

        // Update user stats, XP, level, and streaks
        User user = userRepository.findById(userId).orElseThrow();
        streakService.handleTaskCompletion(user);

        return log;
    }

    @Transactional
    public TaskLog lockCompletedTaskIfExpired(TaskLog log) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (log.getStatus() == TaskStatus.COMPLETED && !log.isLocked()) {
            if (log.getDate().isBefore(today) || (log.getDate().equals(today) && now.isAfter(log.getSchedule().getEndTime()))) {
                log.setLocked(true);
                return taskLogRepository.save(log);
            }
        }
        return log;
    }
}
