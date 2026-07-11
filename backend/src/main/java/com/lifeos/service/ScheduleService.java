package com.lifeos.service;

import com.lifeos.model.RepeatType;
import com.lifeos.model.Schedule;
import com.lifeos.model.User;
import com.lifeos.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public Schedule createSchedule(Schedule schedule, User user) {
        schedule.setUser(user);
        
        // Auto-fill repeat parameters depending on type if not set
        LocalDate date = schedule.getDate() != null ? schedule.getDate() : LocalDate.now();
        if (schedule.getRepeatType() == RepeatType.NONE) {
            schedule.setDate(date);
            schedule.setYear(date.getYear());
            schedule.setMonth(date.getMonthValue());
            schedule.setDay(date.getDayOfMonth());
        } else if (schedule.getRepeatType() == RepeatType.WEEKLY) {
            if (schedule.getDay() == null) {
                // Default to day of week of schedule's target date
                schedule.setDay(date.getDayOfWeek().getValue());
            }
        } else if (schedule.getRepeatType() == RepeatType.MONTHLY) {
            if (schedule.getDay() == null) {
                schedule.setDay(date.getDayOfMonth());
            }
        } else if (schedule.getRepeatType() == RepeatType.YEARLY) {
            if (schedule.getDay() == null) {
                schedule.setDay(date.getDayOfMonth());
            }
            if (schedule.getMonth() == null) {
                schedule.setMonth(date.getMonthValue());
            }
        }
        
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getSchedulesByUser(Long userId) {
        return scheduleRepository.findByUserId(userId);
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
    }

    public void deleteSchedule(Long id, Long userId) {
        Schedule schedule = getScheduleById(id);
        if (!schedule.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized delete attempt");
        }
        scheduleRepository.delete(schedule);
    }

    public boolean appliesToDate(Schedule schedule, LocalDate date) {
        // A schedule cannot apply before it was created
        LocalDate creationDate = schedule.getCreatedAt() != null ? 
                schedule.getCreatedAt().toLocalDate() : LocalDate.now();
        
        if (date.isBefore(creationDate)) {
            return false;
        }

        switch (schedule.getRepeatType()) {
            case NONE:
                return schedule.getDate() != null && schedule.getDate().equals(date);
            case DAILY:
                return true;
            case WEEKLY:
                return schedule.getDay() != null && schedule.getDay() == date.getDayOfWeek().getValue();
            case MONTHLY:
                return schedule.getDay() != null && schedule.getDay() == date.getDayOfMonth();
            case YEARLY:
                return schedule.getDay() != null && schedule.getDay() == date.getDayOfMonth() &&
                        schedule.getMonth() != null && schedule.getMonth() == date.getMonthValue();
            default:
                return false;
        }
    }

    public List<Schedule> getActiveSchedulesForDate(Long userId, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByUserId(userId);
        return schedules.stream()
                .filter(s -> appliesToDate(s, date))
                .collect(Collectors.toList());
    }
}
