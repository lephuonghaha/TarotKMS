const fs = require('fs');
const vm = require('vm');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Add script tag to head if not present
if (!indexHtml.includes('src/utils/interpretationEngine.js')) {
    indexHtml = indexHtml.replace(
        '<script src="card_images.js"></script>',
        '<script src="card_images.js"></script>\n    <!-- Bộ máy luận giải bài Tarot chuyên sâu -->\n    <script src="src/utils/interpretationEngine.js"></script>'
    );
    console.log('Added script tag for interpretationEngine.js to head');
}

// 2. Read the full engine code from src/utils/interpretationEngine.js
const engineCode = fs.readFileSync('src/utils/interpretationEngine.js', 'utf8');

// Replace the functions in index.html between line 1532 and function resetToNewReading()
const startIdx = indexHtml.indexOf('// BỘ MÁY GỌI GEMINI API TRỰC TIẾP');
const endIdx = indexHtml.indexOf('// RESET VÀ TRẢI BÀI MỚI');

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not locate startIdx or endIdx in index.html');
    process.exit(1);
}

const replacement = `// BỘ MÁY GỌI GEMINI API TRỰC TIẾP (DIRECT ANSWER FIRST & CHUẨN 3 PHẦN)
        async function requestGeminiInterpretation(apiKey, question, cards) {
            if (window.TarotInterpretationEngine && window.TarotInterpretationEngine.requestGeminiInterpretation) {
                return await window.TarotInterpretationEngine.requestGeminiInterpretation(apiKey, question, cards);
            }
            // Dự phòng nếu script ngoài chưa tải xong
            const [c1, c2, c3] = cards;
            const cardsDetails = cards.map((c, i) => {
                const pos = ["Căn nguyên / Nền tảng", "Thực trạng / Nút thắt", "Xu hướng / Chuyển hóa"][i];
                const d = c.data || c;
                const m = d.meanings || {};
                const meaning = c.isReversed ? (m.reversed || d.reversed || d.meaningVi) : (m.upright || d.upright || d.meaningVi);
                return \`[Vị trí: \${pos}]\\n- Lá: \${d.nameVi || d.nameEn} (\${d.nameEn || ''}) - Trạng thái: \${c.isReversed ? 'Ngược' : 'Xuôi'}\\n- Ý nghĩa: \${meaning || ''}\\n- Gợi mở sâu: \${d.deepInterpretation || d.fortune || ''}\`;
            }).join('\\n\\n');

            const systemPrompt = \`Bạn là một Tarot Reader đồng hành giàu trải nghiệm, điềm tĩnh, ấm áp và thấu hiểu tâm lý sâu sắc.

## QUY TẮC XƯNG HÔ VÀ GIỌNG VĂN
- Tuyệt đối xưng hô là "mình" và gọi người hỏi là "bạn" (ví dụ: "Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy...").
- Giọng văn: Điềm tĩnh, từng trải, chân thành, phân tích tâm lý thực tế, không dùng từ ngữ sáo rỗng, hoa mỹ giả tạo, giáo điều sách vở hay thần thánh hóa kết quả.

## NGUYÊN TẮC BẮT BUỘC: TRẢ LỜI TRỰC DIỆN NGAY TỪ CÂU ĐẦU TIÊN (DIRECT ANSWER FIRST)
- Phải đọc và hiểu câu hỏi của người dùng (ví dụ: "Có quay lại được không?", "Công việc sắp tới có tiến triển không?", "Có nên nghỉ việc không?").
- Mở đầu phần kết quả, PHẢI đưa ra ngay một câu "chốt" trực tiếp định hướng cho câu hỏi đó trước khi đi vào phân tích lá bài.
  Ví dụ mẫu: "Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy cơ hội quay lại vẫn còn cửa, nhưng hiện tại chưa phải lúc để bạn vội vàng thúc ép đối phương..."
  (Nếu câu hỏi là có/không, nên/không nên, đậu/rớt: BẮT BUỘC đưa ra nhận định nghiêng rõ ràng, không được nói nước đôi kiểu "tùy bạn").

## CẤU TRÚC LUẬN GIẢI CHI TIẾT (BẮT BUỘC THEO ĐÚNG FORMAT SAU):

[Câu chốt trực diện trả lời ngay câu hỏi của người hỏi]

---

### ✦ Phần 1: Phân tích từng lá bài bám sát ngữ cảnh câu hỏi

- **[Tên lá 1] ([Xuôi/Ngược])** — *[Vị trí]*:
  [Giải thích ý nghĩa của lá bài đó (chú ý cờ trạng thái Xuôi/Ngược) gắn liền trực tiếp với tình trạng thực tế của người hỏi, chứ không chép định nghĩa sách giáo khoa. Chỉ rõ tâm lý, hành vi hoặc năng lượng của các bên liên quan.]

- **[Tên lá 2] ([Xuôi/Ngược])** — *[Vị trí]*:
  [Giải thích nút thắt thực tại, tâm lý hoặc sự việc bám sát ngữ cảnh câu hỏi, phản hồi hoặc đối lập với lá 1.]

- **[Tên lá 3] ([Xuôi/Ngược])** — *[Vị trí]*:
  [Giải thích hướng biến chuyển, tâm thế hoặc hệ quả tiếp theo nếu hành động hay không hành động.]

---

### ✦ Phần 2: Ghép cả 3 lá (Tổng hợp dòng chảy năng lượng)

> **Thông điệp cô đọng:** “[Tóm gọn thành một thông điệp cô đọng, sắc bén, ví dụ: 'Còn cửa, nhưng hiện tại cần kiên nhẫn quan sát và giải quyết gốc rễ']”

- **Nguyên nhân gốc rễ:** [Phân tích nguyên nhân sâu xa dẫn đến tình trạng này]
- **Thực trạng hiện tại:** [Phân tích tâm lý giằng xé, rào cản hoặc thực trạng đôi bên hiện tại]
- **Xu hướng tiến triển:** [Nếu duy trì trạng thái hoặc lối hành xử này, mọi chuyện sẽ diễn tiến ra sao]

---

### ✦ Phần 3: Lời khuyên hành động thực tế (Guidance)

1. **[Lời khuyên 1 - Bình tâm / Ranh giới / Quản trị cảm xúc]:** [1 hành động cụ thể người hỏi nên làm lúc này]
2. **[Lời khuyên 2 - Giao tiếp / Đối thoại / Giải quyết tận gốc]:** [1 hành động cụ thể, ví dụ: khi đối thoại thì nên thẳng thắn làm rõ vấn đề cũ thay vì chỉ dựa vào cảm xúc nhất thời]\`;

            const userPromptText = \`Câu hỏi / trăn trở của người hỏi:
"\${question}"

3 lá bài được rút:
- Lá 1: \${(c1.data || c1).nameVi} (\${(c1.data || c1).nameEn}) - \${c1.isReversed ? 'Ngược' : 'Xuôi'}
- Lá 2: \${(c2.data || c2).nameVi} (\${(c2.data || c2).nameEn}) - \${c2.isReversed ? 'Ngược' : 'Xuôi'}
- Lá 3: \${(c3.data || c3).nameVi} (\${(c3.data || c3).nameEn}) - \${c3.isReversed ? 'Ngược' : 'Xuôi'}

Dữ liệu tham khảo của các lá bài:
\${cardsDetails}

Hãy trả lời trực diện vào câu hỏi ngay câu đầu tiên và hoàn thiện bài đọc theo đúng 3 phần quy chuẩn đã yêu cầu.\`;

            const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
            let lastErr = null;

            for (const model of candidateModels) {
                const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`;
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: systemPrompt }] },
                            contents: [{ role: "user", parts: [{ text: userPromptText }] }],
                            generationConfig: { temperature: 0.8, maxOutputTokens: 3000 }
                        })
                    });

                    if (response.ok) {
                        const resData = await response.json();
                        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text && text.trim().length > 0) return text;
                    } else {
                        const errBody = await response.text();
                        console.warn(\`Model \${model} trả về lỗi \${response.status}:\`, errBody);
                        lastErr = new Error(\`Model \${model} (\${response.status})\`);
                    }
                } catch (e) {
                    console.warn(\`Lỗi gọi model \${model}:\`, e);
                    lastErr = e;
                }
            }

            throw lastErr || new Error("Không thể kết nối Gemini API. Vui lòng kiểm tra lại API Key hoặc mạng internet.");
        }

        // BỘ MÁY LUẬN GIẢI ĐỒNG HÀNH CHUYÊN SÂU (OFFLINE ENGINE)
        function generateMasterTarotInterpretation(question, cards) {
            if (window.TarotInterpretationEngine && window.TarotInterpretationEngine.generateMasterTarotInterpretation) {
                return window.TarotInterpretationEngine.generateMasterTarotInterpretation(question, cards);
            }
            // Fallback trực tiếp
            return "Đang tải dữ liệu luận giải...";
        }

        `;

indexHtml = indexHtml.substring(0, startIdx) + replacement + indexHtml.substring(endIdx);

// Syntax validation
const scriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    console.error('Failed to find main script tag');
    process.exit(1);
}

try {
    new vm.Script(scriptMatch[1], { filename: 'index.html' });
    console.log('Script syntax in index.html is 100% VALID!');
} catch (e) {
    console.error('Syntax error in updated index.html:', e);
    process.exit(1);
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html updated successfully!');
