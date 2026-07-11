package com.lifeos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleCategory category;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "repeat_type", nullable = false)
    private RepeatType repeatType;

    // Optional specific date (for NONE repeat type)
    private LocalDate date;

    // Optional fields for repeating patterns
    @Column(name = "\"day\"")
    private Integer day;   // e.g. Day of week (1=Mon, 7=Sun) for WEEKLY, or day of month for MONTHLY

    @Column(name = "\"month\"")
    private Integer month; // Month (1-12) for YEARLY

    @Column(name = "\"year\"")
    private Integer year;  // Year for NONE

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
