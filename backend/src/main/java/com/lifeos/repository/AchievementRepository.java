package com.lifeos.repository;

import com.lifeos.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByUserId(Long userId);
    boolean existsByUserIdAndTitle(Long userId, String title);
}
