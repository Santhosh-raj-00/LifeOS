package com.lifeos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private double completionRate;
    private double missedRate;
    private int currentStreak;
    private int bestStreak;
    private long totalTasks;
    private long totalCompleted;
    private long totalMissed;
    
    // For rendering Line & Bar charts
    private List<Map<String, Object>> taskHistory;
    
    // For rendering Category Breakdown
    private List<Map<String, Object>> categoryBreakdown;
    
    // For Habit Heatmap: date string (YYYY-MM-DD) -> completed count (0 or 1)
    private Map<String, Integer> habitHeatmap;
}
