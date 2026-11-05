# Hướng Dẫn Cơ Sở Dữ Liệu MySQL - Dự Án Tarot (TarotcuaHalle)

Thư mục này chứa toàn bộ định nghĩa cấu trúc bảng (Schema) và dữ liệu mẫu (Seed Data) chuẩn cú pháp **MySQL (InnoDB / utf8mb4)** phục vụ cho hệ thống trải bài và luận giải Tarot.

---

## 1. Cấu Trúc Thư Mục

```text
04-Database/
├── Database.sql       # Khởi tạo database tarot_db và 3 bảng chuẩn InnoDB utf8mb4
├── Sample_Data.sql    # Dữ liệu nguồn sách & 78 câu lệnh INSERT độc lập cho 78 lá bài
└── README.md          # Tài liệu hướng dẫn cài đặt, thiết kế ERD và truy vấn mẫu
```

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (ERD & Quan Hệ)

Hệ thống được thiết kế tối ưu theo chuẩn quan hệ khóa ngoại (Foreign Keys) với cơ chế toàn vẹn dữ liệu:

```mermaid
erDiagram
    KnowledgeSource ||--o{ TarotCard : "trích xuất nghĩa (1 - N)"
    TarotCard ||--o{ ReadingSession : "card_1_id (1 - N)"
    TarotCard ||--o{ ReadingSession : "card_2_id (1 - N)"
    TarotCard ||--o{ ReadingSession : "card_3_id (1 - N)"

    KnowledgeSource {
        VARCHAR(50) source_id PK "Mã tài liệu"
        VARCHAR(255) title "Tên sách/nguồn"
        VARCHAR(100) author "Tác giả"
        INT total_pages "Số trang"
        VARCHAR(100) deck_standard "Quy chuẩn bộ bài"
    }

    TarotCard {
        VARCHAR(50) card_id PK "Mã lá bài (major-0, wands-1,...)"
        VARCHAR(50) source_id FK "Tham chiếu KnowledgeSource"
        VARCHAR(100) name_en "Tên tiếng Anh"
        VARCHAR(100) name_vi "Tên tiếng Việt"
        VARCHAR(20) arcana_type "Major / Minor"
        VARCHAR(20) suit_element "Wands, Cups, Swords, Pentacles, Khí, Nước, Đất, Lửa"
        VARCHAR(100) astrology_link "Liên kết hoàng đạo / hành tinh"
        TEXT keywords "Từ khóa cốt lõi"
        MEDIUMTEXT upright_meaning "Ý nghĩa chiều xuôi"
        MEDIUMTEXT reversed_meaning "Ý nghĩa chiều ngược"
        MEDIUMTEXT actionable_advice "Lời khuyên hành động"
        VARCHAR(255) image_path "Đường dẫn file ảnh"
    }

    ReadingSession {
        VARCHAR(50) session_id PK "Mã phiên trải bài"
        TEXT user_question "Câu hỏi của người dùng"
        VARCHAR(50) topic "Chủ đề (love, work, finance...)"
        VARCHAR(50) card_1_id FK "Lá bài 1 (Quá khứ / Gốc rễ)"
        VARCHAR(50) card_2_id FK "Lá bài 2 (Hiện tại / Thử thách)"
        VARCHAR(50) card_3_id FK "Lá bài 3 (Tương lai / Lời khuyên)"
        LONGTEXT reading_result "Bài luận giải chi tiết"
        TIMESTAMP created_at "Thời điểm tạo"
    }
```

---

## 3. Hướng Dẫn Cài Đặt & Nạp Dữ Liệu (Import Data)

### Cách 1: Sử Dụng MySQL Command Line (Khuyên dùng)

Mở terminal tại thư mục gốc của dự án hoặc thư mục `04-Database/`:

```bash
# Bước 1: Khởi tạo database và cấu trúc các bảng
mysql -u root -p < 04-Database/Database.sql

# Bước 2: Nạp toàn bộ dữ liệu mẫu (Sách nguồn, 78 lá bài, phiên trải bài mẫu)
mysql -u root -p --default-character-set=utf8mb4 tarot_db < 04-Database/Sample_Data.sql
```

### Cách 2: Sử Dụng phpMyAdmin / MySQL Workbench / DBeaver / Navicat

1. Mở công cụ quản lý cơ sở dữ liệu và kết nối đến máy chủ MySQL của bạn.
2. Mở file `Database.sql` và nhấn **Execute (Chạy toàn bộ script)** để tạo database `tarot_db` cùng 3 bảng.
3. Mở tiếp file `Sample_Data.sql` và nhấn **Execute** để nạp dữ liệu sách và trọn bộ 78 lá bài.

> **Lưu ý quan trọng**: Đảm bảo máy chủ MySQL và công cụ client sử dụng mã hóa UTF-8 (`utf8mb4`) để hiển thị trọn vẹn dấu tiếng Việt và các ký tự đặc biệt.

---

## 4. Các Câu Truy Vấn Mẫu Hữu Ích (SQL Query Examples)

### 4.1. Lấy danh sách 22 lá Ẩn Chính (Major Arcana)
```sql
SELECT card_id, name_en, name_vi, suit_element, astrology_link 
FROM TarotCard 
WHERE arcana_type = 'Major';
```

### 4.2. Lấy danh sách lá bài thuộc bộ Cốc (Cups / Nguyên tố Nước)
```sql
SELECT card_id, name_en, name_vi, keywords 
FROM TarotCard 
WHERE suit_element = 'Cups';
```

### 4.3. Tìm kiếm lá bài theo từ khóa tâm trạng / hoàn cảnh (Ví dụ: "khởi đầu", "sáng tạo")
```sql
SELECT card_id, name_vi, keywords, upright_meaning 
FROM TarotCard 
WHERE keywords LIKE '%khởi đầu%' OR keywords LIKE '%sáng tạo%';
```

### 4.4. Truy vấn chi tiết một phiên trải bài kèm thông tin của 3 lá bài đã rút
```sql
SELECT 
    r.session_id,
    r.user_question,
    r.topic,
    c1.name_vi AS card_1_name,
    c2.name_vi AS card_2_name,
    c3.name_vi AS card_3_name,
    r.reading_result,
    r.created_at
FROM ReadingSession r
LEFT JOIN TarotCard c1 ON r.card_1_id = c1.card_id
LEFT JOIN TarotCard c2 ON r.card_2_id = c2.card_id
LEFT JOIN TarotCard c3 ON r.card_3_id = c3.card_id
ORDER BY r.created_at DESC;
```
