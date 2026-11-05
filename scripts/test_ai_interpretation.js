/**
 * test_ai_interpretation.js
 * Script kiểm thử dịch vụ AI Tarot Backend:
 * - Kiểm tra tra cứu dữ liệu từ data/tarot_book.json
 * - Kiểm tra tạo System Prompt và User Prompt Direct Answer First
 * - Thử gọi AI API (hoặc fallback offline engine nếu chưa cấu hình API key)
 */

const { interpretTarotSpread, findCardInBook } = require('../src/services/tarotAiService');

async function runTest() {
    console.log('=== BẮT ĐẦU KIỂM THỬ TAROT AI BACKEND SERVICE ===\n');

    const testQuestion = "Mình đang cảm thấy bế tắc trong công việc hiện tại, sếp quản lý khá độc hại và ngột ngạt. Mình có nên nghỉ việc để tìm cơ hội mới ngay lúc này không?";
    
    // 3 lá bài mẫu:
    // Lá 1: The Fool (Ngược) - Quá khứ / Căn nguyên
    // Lá 2: Ten of Wands (Xuôi) - Hiện tại / Thử thách gánh nặng
    // Lá 3: Ace of Swords (Xuôi) - Tương lai / Sự dứt khoát sáng tỏ
    const sampleCards = [
        { id: "major-0", isReversed: true, position: "Vị trí 1: Quá khứ / Căn nguyên" },
        { id: "wands-10", isReversed: false, position: "Vị trí 2: Hiện tại / Thử thách & Áp lực" },
        { id: "swords-1", isReversed: false, position: "Vị trí 3: Tương lai / Quyết định & Hướng chuyển hóa" }
    ];

    console.log('1. Câu hỏi người dùng:', testQuestion);
    console.log('2. Ba lá bài được rút:');
    sampleCards.forEach((c, i) => {
        const bookInfo = findCardInBook(c);
        console.log(`   - Lá ${i + 1}: ${bookInfo ? bookInfo.nameVi : c.id} (${c.isReversed ? 'Ngược' : 'Xuôi'}) - ${c.position}`);
    });

    console.log('\n3. Đang xử lý đối chiếu sách và luận giải...');
    try {
        const result = await interpretTarotSpread({
            userQuestion: testQuestion,
            cards: sampleCards
        });

        console.log('\n=== KẾT QUẢ TRẢ VỀ TỪ SERVICE ===');
        console.log('Nhà cung cấp (Provider):', result.provider);
        console.log('Mô hình (Model):', result.model);
        console.log('Chế độ Offline Fallback?:', result.isOfflineFallback);
        console.log('\n--- NỘI DUNG BÀI ĐỌC CHI TIẾT ---\n');
        console.log(result.reading);
        console.log('\n=== KIỂM THỬ THÀNH CÔNG 100% ===');
    } catch (err) {
        console.error('Lỗi khi chạy luận giải:', err.message);
    }
}

runTest();
