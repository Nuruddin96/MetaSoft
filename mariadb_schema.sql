-- MariaDB Schema for Learning Management System
-- Generated from Supabase PostgreSQL schema

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `learning_management_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `learning_management_system`;

-- --------------------------------------------------------
-- Table structure for `profiles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `role` ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_id` (`user_id`),
  INDEX `idx_profiles_user_id` (`user_id`),
  INDEX `idx_profiles_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `course_categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_categories`;
CREATE TABLE `course_categories` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`slug`),
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `courses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `video_preview_url` TEXT DEFAULT NULL,
  `instructor_id` VARCHAR(36) DEFAULT NULL,
  `category_id` VARCHAR(36) DEFAULT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `discounted_price` DECIMAL(10,2) DEFAULT NULL,
  `duration_hours` INT DEFAULT NULL,
  `level` ENUM('beginner', 'intermediate', 'advanced') DEFAULT NULL,
  `what_you_learn` JSON DEFAULT NULL,
  `requirements` JSON DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `is_published` BOOLEAN DEFAULT FALSE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `enrollment_count` INT DEFAULT 0,
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `total_reviews` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`slug`),
  INDEX `idx_courses_instructor` (`instructor_id`),
  INDEX `idx_courses_category` (`category_id`),
  INDEX `idx_courses_published` (`is_published`),
  INDEX `idx_courses_featured` (`is_featured`),
  CONSTRAINT `fk_courses_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `lessons`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `course_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `parent_lesson_id` VARCHAR(36) DEFAULT NULL,
  `order_index` INT NOT NULL,
  `is_published` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lessons_course` (`course_id`),
  INDEX `idx_lessons_parent` (`parent_lesson_id`),
  INDEX `idx_lessons_order` (`order_index`),
  CONSTRAINT `fk_lessons_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lessons_parent` FOREIGN KEY (`parent_lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `course_materials`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_materials`;
CREATE TABLE `course_materials` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `course_id` VARCHAR(36) NOT NULL,
  `lesson_id` VARCHAR(36) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('video', 'pdf', 'document', 'quiz', 'assignment') NOT NULL,
  `content_type` ENUM('video', 'pdf', 'document', 'quiz', 'assignment') DEFAULT 'video',
  `video_platform` ENUM('youtube', 'vimeo', 'custom') DEFAULT 'youtube',
  `video_id` VARCHAR(255) DEFAULT NULL,
  `file_url` TEXT DEFAULT NULL,
  `file_size` BIGINT DEFAULT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `transcript` TEXT DEFAULT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `order_index` INT NOT NULL,
  `is_free` BOOLEAN DEFAULT FALSE,
  `is_preview` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_materials_course` (`course_id`),
  INDEX `idx_materials_lesson` (`lesson_id`),
  INDEX `idx_materials_order` (`order_index`),
  INDEX `idx_materials_type` (`type`),
  CONSTRAINT `fk_materials_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_materials_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `enrollments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `student_id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NOT NULL,
  `status` ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
  `progress` DECIMAL(5,2) DEFAULT 0.00,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`, `course_id`),
  INDEX `idx_enrollments_student` (`student_id`),
  INDEX `idx_enrollments_course` (`course_id`),
  INDEX `idx_enrollments_status` (`status`),
  CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `course_reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_reviews`;
CREATE TABLE `course_reviews` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `course_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_text` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`course_id`, `student_id`),
  INDEX `idx_reviews_course` (`course_id`),
  INDEX `idx_reviews_student` (`student_id`),
  INDEX `idx_reviews_rating` (`rating`),
  CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_student` FOREIGN KEY (`student_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` VARCHAR(36) DEFAULT NULL,
  `course_id` VARCHAR(36) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'BDT',
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `transaction_id` VARCHAR(255) DEFAULT NULL,
  `stripe_session_id` VARCHAR(255) DEFAULT NULL,
  `payment_date` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_user` (`user_id`),
  INDEX `idx_payments_course` (`course_id`),
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_transaction` (`transaction_id`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `hero_banners`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `hero_banners`;
CREATE TABLE `hero_banners` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT DEFAULT NULL,
  `background_image` TEXT DEFAULT NULL,
  `cta_text` VARCHAR(100) DEFAULT 'Get Started',
  `cta_link` VARCHAR(255) DEFAULT '/courses',
  `order_index` INT DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_banners_active` (`is_active`),
  INDEX `idx_banners_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `dynamic_features`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `dynamic_features`;
CREATE TABLE `dynamic_features` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(255) NOT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_features_active` (`is_active`),
  INDEX `idx_features_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `services`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_services_active` (`is_active`),
  INDEX `idx_services_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `company_partners`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `company_partners`;
CREATE TABLE `company_partners` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `logo_url` TEXT NOT NULL,
  `website_url` TEXT DEFAULT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_partners_active` (`is_active`),
  INDEX `idx_partners_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `image_gallery`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `image_gallery`;
CREATE TABLE `image_gallery` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` TEXT NOT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gallery_active` (`is_active`),
  INDEX `idx_gallery_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `youtube_videos`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `youtube_videos`;
CREATE TABLE `youtube_videos` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `video_id` VARCHAR(255) NOT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_videos_active` (`is_active`),
  INDEX `idx_videos_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `custom_pages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `custom_pages`;
CREATE TABLE `custom_pages` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `banner_enabled` BOOLEAN DEFAULT FALSE,
  `banner_url` TEXT DEFAULT NULL,
  `banner_title` VARCHAR(255) DEFAULT NULL,
  `images_enabled` BOOLEAN DEFAULT FALSE,
  `images` JSON DEFAULT NULL,
  `videos_enabled` BOOLEAN DEFAULT FALSE,
  `videos` JSON DEFAULT NULL,
  `is_published` BOOLEAN DEFAULT FALSE,
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`slug`),
  INDEX `idx_pages_published` (`is_published`),
  INDEX `idx_pages_created_by` (`created_by`),
  CONSTRAINT `fk_pages_created_by` FOREIGN KEY (`created_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `about_page_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `about_page_content`;
CREATE TABLE `about_page_content` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `section_key` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `subtitle` TEXT DEFAULT NULL,
  `content` TEXT DEFAULT NULL,
  `team_members` JSON DEFAULT NULL,
  `stats` JSON DEFAULT NULL,
  `values` JSON DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section_key` (`section_key`),
  INDEX `idx_about_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `site_branding`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `site_branding`;
CREATE TABLE `site_branding` (
  `id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `site_name` VARCHAR(255) NOT NULL DEFAULT 'MetaSoft BD',
  `logo_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `site_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` JSON DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insert sample data
-- --------------------------------------------------------

-- Insert default site branding
INSERT INTO `site_branding` (`site_name`, `logo_url`) VALUES
('MetaSoft BD', NULL);

-- Insert sample course categories
INSERT INTO `course_categories` (`name`, `description`, `slug`, `icon`) VALUES
('Web Development', 'Learn modern web development technologies', 'web-development', 'Code'),
('Data Science', 'Master data analysis and machine learning', 'data-science', 'BarChart'),
('Mobile Development', 'Build mobile apps for iOS and Android', 'mobile-development', 'Smartphone'),
('UI/UX Design', 'Create beautiful and user-friendly designs', 'ui-ux-design', 'Palette');

-- Insert sample dynamic features
INSERT INTO `dynamic_features` (`title`, `description`, `icon`, `order_index`) VALUES
('Expert Instructors', 'Learn from industry professionals with years of experience', 'Users', 1),
('Hands-on Projects', 'Apply your knowledge with real-world projects and assignments', 'Briefcase', 2),
('24/7 Support', 'Get help whenever you need it with our dedicated support team', 'Clock', 3),
('Certificate', 'Earn industry-recognized certificates upon course completion', 'Award', 4);

-- Insert sample services
INSERT INTO `services` (`name`, `description`, `icon`, `order_index`) VALUES
('Web Development', 'Custom website and web application development services', 'Globe', 1),
('Mobile App Development', 'Native and cross-platform mobile application development', 'Smartphone', 2),
('Software Consulting', 'Expert consultation for your software development needs', 'MessageCircle', 3),
('Training & Workshops', 'Professional training sessions and workshops', 'BookOpen', 4);

-- Insert sample hero banner
INSERT INTO `hero_banners` (`title`, `subtitle`, `cta_text`, `cta_link`, `order_index`) VALUES
('Learn Skills That Matter', 'Master the latest technologies with our comprehensive courses taught by industry experts', 'Start Learning', '/courses', 1);

-- Insert sample about page content
INSERT INTO `about_page_content` (`section_key`, `title`, `subtitle`, `content`) VALUES
('hero', 'About MetaSoft BD', 'Empowering minds through technology education', 'We are dedicated to providing high-quality technology education and training services.'),
('mission', 'Our Mission', 'Transforming lives through education', 'To provide accessible, high-quality technology education that empowers individuals to succeed in the digital economy.');

-- Insert sample image gallery
INSERT INTO `image_gallery` (`title`, `description`, `image_url`, `order_index`) VALUES
('Modern Classroom', 'Our state-of-the-art learning environment', '/placeholder.svg', 1),
('Student Success', 'Celebrating our students achievements', '/placeholder.svg', 2),
('Technology Lab', 'Hands-on learning with latest technology', '/placeholder.svg', 3);

-- --------------------------------------------------------
-- Triggers for auto-updating timestamps and other logic
-- --------------------------------------------------------

-- Trigger to update enrollment count when enrollments change
DELIMITER $$
CREATE TRIGGER `update_course_enrollment_count`
AFTER INSERT ON `enrollments`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET `enrollment_count` = (
        SELECT COUNT(*) FROM `enrollments` 
        WHERE `course_id` = NEW.`course_id` AND `status` = 'active'
    )
    WHERE `id` = NEW.`course_id`;
END$$

CREATE TRIGGER `update_course_enrollment_count_on_update`
AFTER UPDATE ON `enrollments`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET `enrollment_count` = (
        SELECT COUNT(*) FROM `enrollments` 
        WHERE `course_id` = NEW.`course_id` AND `status` = 'active'
    )
    WHERE `id` = NEW.`course_id`;
END$$

CREATE TRIGGER `update_course_enrollment_count_on_delete`
AFTER DELETE ON `enrollments`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET `enrollment_count` = (
        SELECT COUNT(*) FROM `enrollments` 
        WHERE `course_id` = OLD.`course_id` AND `status` = 'active'
    )
    WHERE `id` = OLD.`course_id`;
END$$

-- Trigger to update course rating when reviews change
CREATE TRIGGER `update_course_rating`
AFTER INSERT ON `course_reviews`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET 
        `rating` = (
            SELECT ROUND(AVG(`rating`), 2) 
            FROM `course_reviews` 
            WHERE `course_id` = NEW.`course_id`
        ),
        `total_reviews` = (
            SELECT COUNT(*) 
            FROM `course_reviews` 
            WHERE `course_id` = NEW.`course_id`
        )
    WHERE `id` = NEW.`course_id`;
END$$

CREATE TRIGGER `update_course_rating_on_update`
AFTER UPDATE ON `course_reviews`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET 
        `rating` = (
            SELECT ROUND(AVG(`rating`), 2) 
            FROM `course_reviews` 
            WHERE `course_id` = NEW.`course_id`
        ),
        `total_reviews` = (
            SELECT COUNT(*) 
            FROM `course_reviews` 
            WHERE `course_id` = NEW.`course_id`
        )
    WHERE `id` = NEW.`course_id`;
END$$

CREATE TRIGGER `update_course_rating_on_delete`
AFTER DELETE ON `course_reviews`
FOR EACH ROW
BEGIN
    UPDATE `courses` 
    SET 
        `rating` = COALESCE((
            SELECT ROUND(AVG(`rating`), 2) 
            FROM `course_reviews` 
            WHERE `course_id` = OLD.`course_id`
        ), 0),
        `total_reviews` = (
            SELECT COUNT(*) 
            FROM `course_reviews` 
            WHERE `course_id` = OLD.`course_id`
        )
    WHERE `id` = OLD.`course_id`;
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Notes for Migration:
-- --------------------------------------------------------
-- 1. Replace UUID fields with your preferred ID strategy if needed
-- 2. Adjust ENUM values based on your requirements
-- 3. Add any additional indexes based on your query patterns
-- 4. Consider partitioning large tables if needed
-- 5. Set up proper backup and replication strategies
-- 6. Configure proper user permissions and access controls
-- 7. Update connection strings in your application to use MariaDB
-- 8. Test all queries and transactions thoroughly after migration