# TarotcuaHalle - Luận Giải Vũ Trụ Cùng AI

Trải nghiệm bốc bài Tarot 3D trực quan kết hợp bộ máy luận giải Tarot từ sách "Tarot Chú Giải" và trí tuệ nhân tạo Google Gemini AI.

- **Tên dự án**: TarotcuaHalle
- **Tên miền**: [tarotcuahalle.com](https://tarotcuahalle.com) (hoặc GitHub Pages: `https://dhao1601.github.io/tarotcuahalle/`)
- **Tác giả / Thương hiệu**: Halle
- **Công nghệ**: Three.js, MediaPipe Hands, Google Gemini API, Vanilla JavaScript, CSS Glassmorphism

---

## Cấu hình Tên miền & Deploy

1. **GitHub Pages với Custom Domain**:
   - File `CNAME` đã được cấu hình với domain: `tarotcuahalle.com`
   - Vào **Repository Settings** > **Pages** > Chọn branch `main` (hoặc `gh-pages`), thư mục `/root`.
   - Trong mục **Custom domain**, nhập `tarotcuahalle.com` và nhấn **Save**.

2. **Cấu hình AI API (.env)**:
   - Tạo file `.env` tại thư mục gốc từ mẫu `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Điền Google Gemini API Key hoặc OpenAI API Key vào `.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
     # Hoặc dùng OpenAI:
     # OPENAI_API_KEY=sk-...your_key
     # AI_PROVIDER=openai
     ```

3. **Chạy Local & API Backend**:
   ```bash
   npm start
   # Server sẽ chạy tại http://127.0.0.1:3456
   ```

4. **Kiểm thử AI Backend qua CLI**:
   ```bash
   npm test
   # Chạy kịch bản giả lập rút 3 lá bài và đối chiếu sách + AI
   ```

---

## Backend API Endpoints

- **`GET /api/status`**: Kiểm tra trạng thái máy chủ và kết nối AI API.
- **`GET /api/tarot/cards`**: Lấy danh sách 78 lá bài đã số hóa kèm nguyên tố, chiêm tinh, ý nghĩa.
- **`POST /api/tarot/interpret`**: Luận giải 3 lá bài theo câu hỏi của người dùng.
  - **Body (JSON)**:
    ```json
    {
      "userQuestion": "Mình có nên đổi việc vào lúc này không?",
      "cards": [
        { "id": "major-0", "isReversed": true, "position": "Quá khứ / Căn nguyên" },
        { "id": "wands-10", "isReversed": false, "position": "Hiện tại / Thử thách" },
        { "id": "swords-1", "isReversed": false, "position": "Tương lai / Lời khuyên" }
      ]
    }
    ```
  - **Phản hồi**: Trả về bài đọc định dạng Markdown chi tiết theo triết lý **Direct Answer First** (trả lời trực diện vào câu hỏi ngay từ câu đầu tiên), đối chiếu dữ liệu sách số hóa và phân tích dòng chảy năng lượng 3 lá.


---

## Cấu Trúc Dự Án Chuẩn

```text
tarotcuahalle/
├── assets/                 # Tài nguyên tĩnh (ảnh bìa, hiệu ứng, bộ 78 lá bài JPG)
│   ├── cards/              # Hình ảnh 78 lá bài Tarot
│   ├── back.png            # Mặt sau lá bài
│   └── sparkle.png         # Hiệu ứng bụi sao Three.js
├── data/                   # Dữ liệu cấu trúc ứng dụng
│   ├── database/           # Schema MySQL & Dữ liệu mẫu (Database.sql, Sample_Data.sql)
│   └── tarot_book.json     # Dữ liệu 78 lá bài đã số hóa JSON
├── docs/                   # Sách & tài liệu nghiên cứu Tarot (PDF)
│   ├── Du-Doan-Thoi-Gian-Trong-Tarot.pdf
│   ├── Hanh-Trinh-Tarot.pdf
│   └── Tarot-Chu-Giai.pdf
├── scripts/                # Scripts vận hành, build dữ liệu và local server
│   ├── build_tarot_book.js
│   ├── card_images.js      # Base64 cache cho offline / file://
│   ├── generate_card_images.js
│   ├── server.js           # Static HTTP server
│   └── scratch/            # Các công cụ kiểm thử & phát triển
├── src/                    # Mã nguồn chính frontend
│   ├── utils/              # Bộ máy phân tích, luận giải chuyên sâu
│   └── tarot_book.js       # Dữ liệu bài toàn cục cho web
├── CNAME                   # Cấu hình Custom Domain GitHub Pages
├── index.html              # Giao diện chính ứng dụng Web 3D & AI
├── package.json
└── README.md
```

---

## Cơ Sở Dữ Liệu Chuẩn Bàn Giao (data/database/)

Hệ thống cơ sở dữ liệu MySQL chuẩn InnoDB utf8mb4 tích hợp 3 nguồn tri thức cốt lõi:
1. **Tarot Chú Giải (Phùng Lâm)**: Cấu trúc 78 lá, từ khóa, ý nghĩa xuôi/ngược.
2. **Hành Trình Tarot**: Câu chuyện nguyên mẫu tâm lý học & định hướng Yes/No/Maybe.
3. **Dự đoán thời gian trong Tarot - Philippe Ngô**: Mốc thời gian dự đoán sự việc (Lửa/Nước/Khí/Đất).

Xem chi tiết hướng dẫn cài đặt và ERD tại [data/database/README.md](file:///e:/ChangeOC/tarotcuabin/tarotcuahalle/data/database/README.md).


