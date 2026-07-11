package com.lifeos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "date"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "content_what_i_did", columnDefinition = "TEXT")
    private String contentWhatIDid;

    @Column(name = "content_what_i_learned", columnDefinition = "TEXT")
    private String contentWhatILearned;

    @Column(name = "content_wins", columnDefinition = "TEXT")
    private String contentWins;

    @Column(name = "content_mistakes", columnDefinition = "TEXT")
    private String contentMistakes;

    @Column(name = "content_tomorrow_goals", columnDefinition = "TEXT")
    private String contentTomorrowGoals;

    @Builder.Default
    @Column(nullable = false)
    private boolean locked = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
