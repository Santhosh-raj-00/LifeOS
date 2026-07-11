CREATE DATABASE IF NOT EXISTS lifeos;
USE lifeos;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    phone VARCHAR(20) UNIQUE NULL,
    password VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    last_active_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    repeat_type VARCHAR(50) NOT NULL,
    date DATE NULL,
    day INT NULL,
    month INT NULL,
    year INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP NULL,
    missed_at TIMESTAMP NULL,
    locked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule_date (schedule_id, date)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    content_what_i_did TEXT NULL,
    content_what_i_learned TEXT NULL,
    content_wins TEXT NULL,
    content_mistakes TEXT NULL,
    content_tomorrow_goals TEXT NULL,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_journal_date (user_id, date)
);

CREATE TABLE IF NOT EXISTS habits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habit_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habit_date (habit_id, date)
);

CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, title)
);
