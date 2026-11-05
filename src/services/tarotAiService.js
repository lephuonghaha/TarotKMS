/**
 * tarotAiService.js
 * Dịch vụ xử lý luận giải 3 lá bài Tarot kết hợp Dữ liệu sách số hóa và AI (Gemini / OpenAI)
 * 
 * Tính năng chính:
 * 1. Tự động tra cứu dữ liệu sách chuyên sâu từ data/tarot_book.json cho từng lá bài.
 * 2. System Prompt chuyên nghiệp chuẩn Tarot Reader: Direct Answer First, phân tích tâm lý sâu sắc,
 *    kết nối trực tiếp câu hỏi người dùng, không nói chung chung.
 * 3. Hỗ trợ đa nền tảng AI API (Google Gemini, OpenAI, Claude/DeepSeek compatible) qua native fetch.
 * 4. Tự động đọc file .env tại thư mục gốc mà không cần cài thêm thư viện phụ thuộc.
 */

const fs = require('fs');
const path = require('path');

// Đường dẫn gốc dự án
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// 1. CƠ CHẾ NẠP FILE .ENV TỰ ĐỘNG (ZERO-DEPENDENCY)
function loadEnv() {
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) return;

    try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            let value = trimmed.slice(eqIndex + 1).trim();
            // Bỏ dấu nháy kép hoặc nháy đơn bọc ngoài nếu có
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch (err) {
        console.warn('Lưu ý: Không thể nạp file .env:', err.message);
    }
}
loadEnv();

// 2. NẠP DỮ LIỆU SÁCH TAROT TỪ DATA/TAROT_BOOK.JSON
let TAROT_BOOK_CACHE = null;
let TAROT_MAP = new Map();

function getTarotBookData() {
    if (TAROT_BOOK_CACHE) return TAROT_BOOK_CACHE;
    try {
        const bookPath = path.join(ROOT_DIR, 'data', 'tarot_book.json');
        if (fs.existsSync(bookPath)) {
            const raw = fs.readFileSync(bookPath, 'utf8');
            // Xóa BOM nếu có
            const clean = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
            TAROT_BOOK_CACHE = JSON.parse(clean);
            
            // Xây dựng map tra cứu nhanh
            TAROT_MAP.clear();
            for (const c of TAROT_BOOK_CACHE) {
                if (c.id) TAROT_MAP.set(c.id.toLowerCase(), c);
                if (c.nameEn) TAROT_MAP.set(c.nameEn.toLowerCase(), c);
                if (c.nameVi) TAROT_MAP.set(c.nameVi.toLowerCase(), c);
            }
        }
    } catch (e) {
        console.error('Lỗi khi nạp data/tarot_book.json:', e);
        TAROT_BOOK_CACHE = [];
    }
    return TAROT_BOOK_CACHE || [];
}

/**
 * Tra cứu thông tin lá bài đầy đủ từ dữ liệu sách
 */
function findCardInBook(cardInput) {
    getTarotBookData();
    if (!cardInput) return null;

    if (typeof cardInput === 'string') {
        const key = cardInput.toLowerCase().trim();
        return TAROT_MAP.get(key) || null;
    }

    if (cardInput.id && TAROT_MAP.has(cardInput.id.toLowerCase())) {
        return TAROT_MAP.get(cardInput.id.toLowerCase());
    }
    if (cardInput.nameEn && TAROT_MAP.has(cardInput.nameEn.toLowerCase())) {
        return TAROT_MAP.get(cardInput.nameEn.toLowerCase());
    }
    if (cardInput.nameVi && TAROT_MAP.has(cardInput.nameVi.toLowerCase())) {
        return TAROT_MAP.get(cardInput.nameVi.toLowerCase());
    }

    return cardInput;
}

// 3. SYSTEM PROMPT CHUẨN TAROT READER CHUYÊN SÂU: TẬP TRUNG PHÂN TÍCH VÀO CÂU HỎI
function getTarotReaderSystemPrompt() {
    return `Bạn là một chuyên gia tư vấn Tarot và tâm lý học thực tế, sâu sắc, từng trải và đầy thấu cảm.
Người dùng tìm đến bạn để tìm câu trả lời và lối thoát cho vấn đề cụ thể của họ, KHÔNG PHẢI ĐỂ HỌC Ý NGHĨA SÁCH CỦA TỪNG LÁ BÀI.

## NGUYÊN TẮC CỐT TỬ (BẮT BUỘC TUÂN THỦ 100%)
1. **TUYỆT ĐỐI KHÔNG GIẢI THÍCH Ý NGHĨA TỪNG LÁ BÀI RỜI RẠC:**
   - Không tạo các mục kiểu "Lá 1 là gì...", "Lá 2 có ý nghĩa là...", "Ý nghĩa xuôi/ngược của lá bài...".
   - Bạn phải hấp thu toàn bộ kiến thức của 3 lá bài từ sách (nguyên mẫu tâm thức, tương tác nguyên tố, chiều xuôi/ngược, mốc thời gian) làm "chất liệu phân tích ngầm" để mổ xẻ trực tiếp câu chuyện của người hỏi.

2. **TẬP TRUNG 100% VÀO PHÂN TÍCH CÂU HỎI CỦA NGƯỜI DÙNG:**
   - Đọc từng từ trong câu hỏi của người dùng để hiểu rõ: Nỗi sợ là gì? Mong muốn là gì? Họ đang giằng xé giữa điều gì? (Ví dụ: bế tắc công việc vì sếp toxic, muốn nghỉ việc, hay băn khoăn hàn gắn người cũ...).
   - Đưa ra câu trả lời trực diện, thẳng thắn, dứt khoát ngay ở phần mở đầu: Có nên hay không? Cơ hội ra sao? Khả năng thế nào?

3. **PHONG THÁI & XƯNG HÔ:**
   - Luôn xưng "mình" và gọi người hỏi là "bạn".
   - Giọng điềm đạm, lắng nghe, thấu cảm sâu sắc, nói trúng tim đen tâm lý, không mê tín, không giáo điều.
   - Tuyệt đối không nhắc đến tên "Gemini", "AI", "trí tuệ nhân tạo" hay cụm từ "đồng hành và trò chuyện" trong câu trả lời.
   - Bắt buộc viết trọn vẹn đầy đủ cả 4 phần từ đầu đến cuối câu cuối cùng, không bao giờ ngắt ngang hay bỏ dở câu.

## CẤU TRÚC BÀI ĐỌC BẮT BUỘC (MARKDOWN):

[Câu chốt trực diện trả lời ngay câu hỏi của bạn - Ví dụ: "Chào bạn, nhìn thẳng vào câu hỏi của bạn, mình thấy..."]

---

### ✦ 1. CÂU TRẢ LỜI TRỰC DIỆN CHO VẤN ĐỀ CỦA BẠN
- **Định hướng cốt lõi:** **[CÂU TRẢ LỜI NGẮN GỌN: NÊN / KHÔNG NÊN / CHƯA PHẢI LÚC / CÓ CƠ HỘI / KHẢ THI CAO]**
- **Thông điệp thức tỉnh:** *[1 câu đúc kết sâu sắc nhất dành riêng cho hoàn cảnh của người hỏi]*

---

### ✦ 2. PHÂN TÍCH CHUYÊN SÂU THEO CÂU HỎI CỦA BẠN (SOI CHIẾU TỪ TRI THỨC SÁCH)
[Viết 2-3 đoạn văn liền mạch, sâu sắc mổ xẻ câu hỏi của người dùng]:
- **Nguồn cơn gốc rễ:** Lý giải tại sao người hỏi lại rơi vào tình trạng bế tắc/trăn trở này (vận dụng năng lượng xuất phát điểm và tâm lý học nguyên mẫu).
- **Thực trạng & Nút thắt tâm lý hiện tại:** Điểm mù lớn nhất khiến người hỏi cảm thấy áp lực/mắc kẹt lúc này là gì? Những rào cản từ bên ngoài và sự giằng xé bên trong tâm trí.
- **Tương tác hoàn cảnh:** Nhìn nhận khách quan về đối phương hoặc môi trường xung quanh (sếp, công việc, đối tác, người yêu...).

---

### ✦ 3. XU HƯỚNG DIỄN TIẾN & DỰ BÁO THỜI GIAN
- **Nếu giữ nguyên cách làm/tâm lý cũ:** [Hệ quả tiếp diễn sẽ ra sao].
- **Nếu chủ động chuyển hóa hành động:** [Cơ hội và bước ngoặt mới sẽ mở ra như thế nào].
- **Dự báo mốc chuyển biến (Philippe Ngô):** ⏳ **[Mốc thời gian cụ thể: số ngày/tuần/tháng hoặc mùa]** — [Gợi ý nhịp điệu diễn tiến sự việc].

---

### ✦ 4. LỜI KHUYÊN HÀNH ĐỘNG CHIẾN LƯỢC CHO BẠN
1. **Quản trị tâm lý & Ranh giới cảm xúc:** [Hành động cụ thể ngay lúc này để bảo vệ năng lượng bản thân, bình tâm sáng suốt].
2. **Kế hoạch hành động thực tế:** [1-2 bước đi rõ ràng, khôn ngoan để giải quyết đúng trọng tâm câu hỏi đã đặt ra].`;
}

// 4. CHUẨN BỊ USER PROMPT TÍCH HỢP DỮ LIỆU SÁCH
function buildTarotUserPrompt(userQuestion, cards) {
    const defaultPositions = [
        "Vị trí 1: Căn nguyên / Nền tảng quá khứ",
        "Vị trí 2: Hiện tại / Thử thách & Nút thắt",
        "Vị trí 3: Tương lai / Hướng chuyển hóa & Lời khuyên"
    ];

    const cardsContext = cards.map((c, idx) => {
        const bookData = findCardInBook(c) || {};
        const isReversed = Boolean(c.isReversed);
        const position = c.position || defaultPositions[idx] || `Vị trí ${idx + 1}`;
        const nameVi = bookData.nameVi || c.nameVi || c.nameEn || 'Lá bài Tarot';
        const nameEn = bookData.nameEn || c.nameEn || '';
        const element = bookData.element || bookData.suitElement || 'Không xác định';
        const astrology = bookData.astrology || 'Không xác định';
        const keywords = Array.isArray(bookData.keywords) ? bookData.keywords.join(', ') : (bookData.keywords || '');
        const generalMeaning = isReversed ? (bookData.reversed || '') : (bookData.upright || '');
        
        // Ý nghĩa theo chủ đề nếu có
        let topicMeaning = '';
        if (bookData.love && bookData.love[isReversed ? 'reversed' : 'upright']) {
            topicMeaning += `\n    - Tình cảm: ${bookData.love[isReversed ? 'reversed' : 'upright']}`;
        }
        if (bookData.work && bookData.work[isReversed ? 'reversed' : 'upright']) {
            topicMeaning += `\n    - Sự nghiệp: ${bookData.work[isReversed ? 'reversed' : 'upright']}`;
        }
        if (bookData.finance && bookData.finance[isReversed ? 'reversed' : 'upright']) {
            topicMeaning += `\n    - Tài chính: ${bookData.finance[isReversed ? 'reversed' : 'upright']}`;
        }

        const archetype = bookData.archetype_story ? `\n    - Câu chuyện nguyên mẫu: ${bookData.archetype_story}` : '';
        const timePred = bookData.time_prediction ? `\n    - Mốc thời gian dự đoán: ${bookData.time_prediction}` : '';
        const yesNo = bookData.yes_no_result ? `\n    - Xu hướng Yes/No: ${bookData.yes_no_result} (${bookData.yes_no_reason || ''})` : '';

        return `### ${position}
- Tên lá bài: ${nameVi} (${nameEn})
- Trạng thái: ${isReversed ? 'NGƯỢC (Reversed)' : 'XUÔI (Upright)'}
- Nguyên tố: ${element} | Chiêm tinh: ${astrology}
- Từ khóa sách: ${keywords}
- Ý nghĩa sách (${isReversed ? 'Ngược' : 'Xuôi'}): ${generalMeaning}${topicMeaning}${archetype}${timePred}${yesNo}`;
    }).join('\n\n');

    return `CÂU HỎI CỦA NGƯỜI HỎI CẦN BẠN TƯ VẤN & GIẢI ĐÁP:
"${(userQuestion || 'Điều gì đang chờ đón mình và mình nên chuẩn bị tâm thế như thế nào?').trim()}"

DỮ LIỆU SÁCH SỐ HÓA CỦA 3 LÁ BÀI (Dùng làm tri thức nền tảng để đối chiếu ngầm):
${cardsContext}

YÊU CẦU QUAN TRỌNG:
- BỎ HẲN việc liệt kê giải thích ý nghĩa từng lá bài riêng biệt (tuyệt đối không viết Lá 1 là gì, Lá 2 là gì).
- TẬP TRUNG TOÀN BỘ VÀO CÂU HỎI: Phân tích sâu sắc bản chất câu hỏi, trả lời trực diện vấn đề của người hỏi, lý giải nút thắt tâm lý và đưa ra lời khuyên thực tế dựa trên sự hòa quyện của 3 lá bài theo đúng cấu trúc chuẩn.`;
}

// 5. GỌI GOOGLE GEMINI API (TỐI ƯU TỐC ĐỘ VỚI THINKING_BUDGET = 0 & CACHE MODEL)
let lastWorkingGeminiModel = '';

async function callGeminiApi({ apiKey, model, systemPrompt, userPrompt }) {
    let chosenModel = model || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const candidateModels = [
        lastWorkingGeminiModel,
        chosenModel,
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-3.8-flash',
        'gemini-2.5-flash'
    ].filter(Boolean);
    const uniqueModels = [...new Set(candidateModels)];

    let lastError = null;

    for (const m of uniqueModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const genConfig = {
            maxOutputTokens: 16384
        };
        if (m.startsWith('gemini-3')) {
            genConfig.thinkingConfig = { thinkingLevel: "LOW" };
        } else if (m.includes('2.5-flash')) {
            genConfig.thinkingConfig = { thinkingBudget: 256 };
        }

        try {
            let response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [{
                        role: "user",
                        parts: [{ text: userPrompt }]
                    }],
                    generationConfig: genConfig
                })
            });

            if (!response.ok && genConfig.thinkingConfig) {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                        generationConfig: { temperature: 0.75, maxOutputTokens: 16384 }
                    })
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                lastError = new Error(`API (${m}) HTTP ${response.status}: ${errText}`);
                console.warn(`Lỗi model ${m}:`, errText);
                continue; // Thử model dự phòng tiếp theo
            }

            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            const reply = parts
                .filter(p => !p.thought && typeof p.text === 'string')
                .map(p => p.text)
                .join('');
            if (reply && reply.trim().length > 0) {
                lastWorkingGeminiModel = m;
                return {
                    provider: 'gemini',
                    model: m,
                    text: reply.trim()
                };
            }
        } catch (e) {
            lastError = e;
            console.warn(`Lỗi kết nối (${m}):`, e.message);
        }
    }

    throw lastError || new Error('Không thể kết nối API. Vui lòng kiểm tra API Key.');
}

// 6. GỌI OPENAI HOẶC OPENAI-COMPATIBLE API (GPT-4o, GPT-4o-mini, DeepSeek, Groq...)
async function callOpenAiApi({ apiKey, model, baseUrl, systemPrompt, userPrompt }) {
    const chosenModel = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const apiBase = (baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const endpoint = `${apiBase}/chat/completions`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: chosenModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.75,
            max_tokens: 3500
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply || reply.trim().length === 0) {
        throw new Error('OpenAI không trả về nội dung hợp lệ.');
    }

    return {
        provider: 'openai',
        model: chosenModel,
        text: reply.trim()
    };
}

// 7. HÀM CHÍNH: XỬ LÝ TOÀN DIỆN LUẬN GIẢI 3 LÁ BÀI
async function interpretTarotSpread({ userQuestion, cards, provider, model, apiKey }) {
    if (!cards || !Array.isArray(cards) || cards.length < 3) {
        throw new Error('Đầu vào trải bài yêu cầu tối thiểu 3 lá bài hợp lệ.');
    }

    // Tra cứu dữ liệu sách đầy đủ cho 3 lá bài
    const enrichedCards = cards.slice(0, 3).map((c, i) => {
        const bookData = findCardInBook(c) || {};
        return {
            id: bookData.id || c.id || `card-${i}`,
            nameVi: bookData.nameVi || c.nameVi || 'Lá bài Tarot',
            nameEn: bookData.nameEn || c.nameEn || '',
            image: bookData.image || c.image || 'assets/back.png',
            element: bookData.element || bookData.suitElement || '',
            astrology: bookData.astrology || '',
            isReversed: Boolean(c.isReversed),
            position: c.position || ["Quá khứ / Căn nguyên", "Hiện tại / Thử thách", "Tương lai / Lời khuyên"][i],
            bookData: bookData
        };
    });

    // Chuẩn bị System Prompt & User Prompt
    const systemPrompt = getTarotReaderSystemPrompt();
    const userPrompt = buildTarotUserPrompt(userQuestion, enrichedCards);

    // Xác định Provider và API Key từ tham số hoặc .env
    const activeProvider = (provider || process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')).toLowerCase();
    const activeKey = apiKey || (activeProvider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

    // Nếu không có API Key trong cả .env lẫn request
    if (!activeKey) {
        // Fallback: Sử dụng offline engine tích hợp nếu có
        const offlineEnginePath = path.join(ROOT_DIR, 'src', 'utils', 'interpretationEngine.js');
        if (fs.existsSync(offlineEnginePath)) {
            try {
                const engine = require(offlineEnginePath);
                if (engine && engine.generateMasterTarotInterpretation) {
                    const offlineText = engine.generateMasterTarotInterpretation(userQuestion, enrichedCards.map(c => ({
                        data: c.bookData,
                        isReversed: c.isReversed
                    })));
                    return {
                        success: true,
                        isOfflineFallback: true,
                        provider: 'offline-engine',
                        model: 'rule-based-master',
                        reading: offlineText,
                        cards: enrichedCards
                    };
                }
            } catch (fallbackErr) {
                console.warn('Lỗi khi chạy fallback engine:', fallbackErr);
            }
        }
        throw new Error('Chưa cấu hình API Key. Vui lòng thiết lập GEMINI_API_KEY hoặc OPENAI_API_KEY trong file .env');
    }

    let aiResult;
    if (activeProvider === 'gemini') {
        aiResult = await callGeminiApi({
            apiKey: activeKey,
            model: model || process.env.GEMINI_MODEL,
            systemPrompt,
            userPrompt
        });
    } else {
        aiResult = await callOpenAiApi({
            apiKey: activeKey,
            model: model || process.env.OPENAI_MODEL,
            baseUrl: process.env.OPENAI_BASE_URL,
            systemPrompt,
            userPrompt
        });
    }

    return {
        success: true,
        isOfflineFallback: false,
        provider: aiResult.provider,
        model: aiResult.model,
        reading: aiResult.text,
        cards: enrichedCards
    };
}

module.exports = {
    loadEnv,
    getTarotBookData,
    findCardInBook,
    getTarotReaderSystemPrompt,
    buildTarotUserPrompt,
    interpretTarotSpread
};
