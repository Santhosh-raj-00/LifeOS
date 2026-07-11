package com.lifeos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_logs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"schedule_id", "date"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "missed_at")
    private LocalDateTime missedAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean locked = false;
}
