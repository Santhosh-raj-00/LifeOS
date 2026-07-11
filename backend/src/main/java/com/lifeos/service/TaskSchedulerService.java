package com.lifeos.service;

import com.lifeos.model.TaskLog;
import com.lifeos.model.TaskStatus;
import com.lifeos.model.User;
import com.lifeos.repository.TaskLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class TaskSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(TaskSchedulerService.class);

    @Autowired
    private TaskLogRepository taskLogRepository;

    @Autowired
    private StreakService streakService;

    // Runs every minute
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkAndLockMissedTasks() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Check pending tasks for today that have expired
        List<TaskLog> pendingLogs = taskLogRepository.findByStatusAndDateAndLocked(
                TaskStatus.PENDING, today, false
        );

        boolean streakUpdateNeeded = false;
        User userToUpdate = null;

        for (TaskLog taskLog : pendingLogs) {
            if (now.isAfter(taskLog.getSchedule().getEndTime())) {
                log.info("Task ID {} ('{}') has expired. Marking as MISSED and locking.", 
                        taskLog.getId(), taskLog.getSchedule().getTitle());
                
                taskLog.setStatus(TaskStatus.MISSED);
                taskLog.setLocked(true);
                taskLog.setMissedAt(LocalDateTime.of(today, taskLog.getSchedule().getEndTime()));
                taskLogRepository.save(taskLog);

                streakUpdateNeeded = true;
                if (userToUpdate == null) {
                    userToUpdate = taskLog.getSchedule().getUser();
                }
            }
        }

        // 2. Lock completed tasks that are now past their end time (so they cannot be undone)
        List<TaskLog> completedLogs = taskLogRepository.findByStatusAndDateAndLocked(
                TaskStatus.COMPLETED, today, false
        );
        for (TaskLog taskLog : completedLogs) {
            if (now.isAfter(taskLog.getSchedule().getEndTime())) {
                log.info("Locking completed task ID {} ('{}') since its window has closed.",
                        taskLog.getId(), taskLog.getSchedule().getTitle());
                taskLog.setLocked(true);
                taskLogRepository.save(taskLog);
            }
        }

        // 3. Recalculate streak if any task was missed
        if (streakUpdateNeeded && userToUpdate != null) {
            streakService.recalculateAndSaveStreak(userToUpdate);
        }
    }
}
