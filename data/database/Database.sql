-- ==============================================================================
-- DỰ ÁN: TAROTCUAHALLE (HỆ THỐNG LUẬN GIẢI TAROT & THEO DÕI PHIÊN TRẢI BÀI)
-- FILE: Database.sql
-- MÔ TẢ: Khởi tạo cấu trúc cơ sở dữ liệu MySQL chuẩn (ENGINE=InnoDB DEFAULT CHARSET=utf8mb4)
-- TÍCH HỢP 3 NGUỒN TRI THỨC CỐT LÕI:
--   1. Sách "Tarot Chú Giải" (Phùng Lâm): Cấu trúc 78 lá, từ khóa, nghĩa xuôi & ngược.
--   2. Sách "Hành Trình Tarot": Câu chuyện nguyên mẫu tâm lý học & định hướng Yes/No chiều sâu.
--   3. Tài liệu "Dự đoán thời gian trong Tarot - Philippe Ngô": Mốc thời gian dự đoán.
-- GỒM ĐÚNG 2 BẢNG:
--   - TarotCard: Bảng lưu trữ 78 lá bài Tarot tích hợp 3 nguồn tri thức.
--   - ReadingSession: Bảng theo dõi lịch sử phiên trải bài (Tracking KMS).
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `tarot_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `tarot_db`;

-- Xóa bảng cũ theo thứ tự quan hệ khóa ngoại
DROP TABLE IF EXISTS `ReadingSession`;
DROP TABLE IF EXISTS `TarotCard`;

-- ==============================================================================
-- 1. BẢNG TarotCard (Danh mục 78 lá bài Tarot tích hợp 3 nguồn tri thức cốt lõi)
-- ==============================================================================
CREATE TABLE `TarotCard` (
    `card_id` VARCHAR(50) NOT NULL COMMENT 'Mã lá bài duy nhất (Primary Key, VD: major-0, wands-1)',
    `name_vi` VARCHAR(100) NOT NULL COMMENT 'Tên tiếng Việt đầy đủ của lá bài',
    `name_en` VARCHAR(100) NOT NULL COMMENT 'Tên tiếng Anh chuẩn quốc tế của lá bài',
    `arcana_type` VARCHAR(20) NOT NULL COMMENT 'Phân loại bộ ẩn: Major (Ẩn Chính) hoặc Minor (Ẩn Phụ)',
    `suit_element` VARCHAR(20) DEFAULT 'None' COMMENT 'Nguyên tố: Lửa / Nước / Khí / Đất / None',
    `keywords` TEXT DEFAULT NULL COMMENT 'Từ khóa cốt lõi trích từ sách Tarot Chú Giải',
    `upright_meaning` MEDIUMTEXT DEFAULT NULL COMMENT 'Ý nghĩa chiều xuôi trích từ sách Tarot Chú Giải',
    `reversed_meaning` MEDIUMTEXT DEFAULT NULL COMMENT 'Ý nghĩa chiều ngược trích từ sách Tarot Chú Giải',
    `archetype_story` MEDIUMTEXT DEFAULT NULL COMMENT 'Câu chuyện nguyên mẫu tâm lý học trích từ sách Hành Trình Tarot',
    `yes_no_result` VARCHAR(10) NOT NULL COMMENT 'Định hướng câu hỏi Có/Không (YES / NO / MAYBE)',
    `yes_no_reason` TEXT DEFAULT NULL COMMENT 'Lý do tâm lý/triết lý giải thích kết quả Yes/No từ Hành Trình Tarot',
    `time_prediction` VARCHAR(255) DEFAULT NULL COMMENT 'Mốc thời gian dự đoán sự việc từ tài liệu Philippe Ngô',
    `image_path` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn file ảnh lá bài (VD: cards/the_fool.jpg)',
    PRIMARY KEY (`card_id`),
    KEY `idx_arcana` (`arcana_type`),
    KEY `idx_suit_element` (`suit_element`),
    KEY `idx_yes_no` (`yes_no_result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ thông tin 78 lá bài Tarot tích hợp 3 nguồn tri thức';

-- ==============================================================================
-- 2. BẢNG ReadingSession (Theo dõi phiên trải bài - Tracking KMS)
-- ==============================================================================
CREATE TABLE `ReadingSession` (
    `session_id` VARCHAR(50) NOT NULL COMMENT 'Mã định danh duy nhất của phiên trải bài (Primary Key)',
    `user_question` TEXT NOT NULL COMMENT 'Nội dung câu hỏi hoặc tâm sự của người dùng',
    `topic` VARCHAR(50) DEFAULT NULL COMMENT 'Chủ đề: general, love, work, finance, exam...',
    `card_1_id` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 1 (Quá khứ / Căn nguyên)',
    `card_2_id` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 2 (Hiện tại / Thử thách & Nút thắt)',
    `card_3_id` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 3 (Tương lai / Lời khuyên dẫn lối)',
    `reading_result` LONGTEXT DEFAULT NULL COMMENT 'Nội dung bài luận giải chi tiết từ hệ thống/AI',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm diễn ra phiên trải bài',
    PRIMARY KEY (`session_id`),
    KEY `idx_card_1` (`card_1_id`),
    KEY `idx_card_2` (`card_2_id`),
    KEY `idx_card_3` (`card_3_id`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_session_card1` FOREIGN KEY (`card_1_id`) 
        REFERENCES `TarotCard` (`card_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_session_card2` FOREIGN KEY (`card_2_id`) 
        REFERENCES `TarotCard` (`card_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_session_card3` FOREIGN KEY (`card_3_id`) 
        REFERENCES `TarotCard` (`card_id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng theo dõi lịch sử phiên trải bài Tarot (Tracking KMS)';

SET FOREIGN_KEY_CHECKS = 1;
