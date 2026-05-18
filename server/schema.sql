-- ============================================================
--  GoGenix AI — Complete Database Schema
--  Paste in phpMyAdmin → u416856653_test → SQL → Go
-- ============================================================

CREATE TABLE IF NOT EXISTS `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `mobile` VARCHAR(50),
  `year` VARCHAR(100),
  `department` VARCHAR(255),
  `score` INT DEFAULT 0,
  `total_questions` INT DEFAULT 60,
  `percentage` DECIMAL(5,2) DEFAULT 0,
  `domain_scores` JSON,
  `answers` JSON,
  `status` ENUM('completed','terminated') DEFAULT 'completed',
  `reason` VARCHAR(500),
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_email`(`email`), KEY `idx_status`(`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `question_bank` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL,
  `data` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_config_key`(`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(500) DEFAULT '',
  `description` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `job_openings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `required_skills` JSON,
  `experience_level` ENUM('fresher','junior','mid','senior') DEFAULT 'fresher',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `resume_scans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `job_id` INT,
  `resume_text` LONGTEXT,
  `extracted_skills` JSON,
  `match_score` DECIMAL(5,2) DEFAULT 0,
  `fit_summary` TEXT,
  `ai_raw_response` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_job`(`user_email`,`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ai_assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `job_id` INT,
  `company_id` INT,
  `questions` JSON,
  `answers` JSON,
  `score` INT DEFAULT 0,
  `domain_scores` JSON,
  `percentage` DECIMAL(5,2) DEFAULT 0,
  `ai_analysis` JSON,
  `time_taken` INT DEFAULT 0,
  `status` ENUM('pending','completed','terminated') DEFAULT 'pending',
  `reason` VARCHAR(500),
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_job`(`user_email`,`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
