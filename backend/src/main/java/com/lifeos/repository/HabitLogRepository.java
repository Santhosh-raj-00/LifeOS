package com.lifeos.repository;

import com.lifeos.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    Optional<HabitLog> findByHabitIdAndDate(Long habitId, LocalDate date);
    List<HabitLog> findByHabitUserIdAndDate(Long userId, LocalDate date);
    List<HabitLog> findByHabitUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<HabitLog> findByHabitId(Long habitId);
}
