package com.lifeos.repository;

import com.lifeos.model.TaskLog;
import com.lifeos.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {
    Optional<TaskLog> findByScheduleIdAndDate(Long scheduleId, LocalDate date);
    List<TaskLog> findByScheduleUserIdAndDate(Long userId, LocalDate date);
    List<TaskLog> findByScheduleUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<TaskLog> findByDate(LocalDate date);
    List<TaskLog> findByStatusAndDateAndLocked(TaskStatus status, LocalDate date, boolean locked);
}
