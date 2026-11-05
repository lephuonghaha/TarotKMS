const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('index.html', 'utf8');

const badMiddle = `                readingMarkdown = generateMasterTarotInterpretation(userQ            const systemPrompt = \`Bạn là người đọc tarot đồng hành, nói chuyện tự nhiên như một người bạn đáng tin, không phải sách giáo khoa.`;

const goodMiddle = `                readingMarkdown = generateMasterTarotInterpretation(userQuestion, cardsData);
            }

            generatedAiReadingText = readingMarkdown;
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            contentEl.innerHTML = marked.parse(readingMarkdown);

            if (!apiKey) {
                keyPromptBanner.style.display = 'block';
            } else {
                keyPromptBanner.style.display = 'none';
            }
        }

        // BỘ MÁY GỌI GEMINI API TRỰC TIẾP
        async function requestGeminiInterpretation(apiKey, question, cards) {
            const [c1, c2, c3] = cards;
            const cardsDetails = cards.map((c, i) => {
                const pos = ["Cội nguồn / Quá khứ gần", "Hiện tại / Thử thách thực tế", "Tương lai gần / Lời khuyên chuyển hóa"][i];
                const d = c.data;
                const m = d.meanings || {};
                const meaning = c.isReversed ? (m.reversed || d.reversed) : (m.upright || d.upright);
                return \`[Vị trí: \${pos}]\n- Lá: \${d.nameVi} (\${d.nameEn}) - Trạng thái: \${c.isReversed ? 'Ngược' : 'Xuôi'}\n- Ý nghĩa chính: \${meaning || ''}\n- Thông điệp sâu: \${d.deepInterpretation || d.fortune || ''}\`;
            }).join('\\n\\n');

            const systemPrompt = \`Bạn là người đọc tarot đồng hành, nói chuyện tự nhiên như một người bạn đáng tin, không phải sách giáo khoa.`;

if (!content.includes(badMiddle)) {
    console.error('ERROR: badMiddle was not found in index.html!');
    process.exit(1);
}
content = content.replace(badMiddle, goodMiddle);

const idx1 = content.indexOf('return `${bullets}\\n\\n${conclusionBlock}`;');
const idx2 = content.indexOf('function resetToNewReading()');

if (idx1 === -1 || idx2 === -1) {
    console.error('ERROR: Could not find return bullets or resetToNewReading');
    process.exit(1);
}

const between = content.substring(idx1, idx2);

const goodBetween = `return \`\${bullets}\\n\\n\${conclusionBlock}\`;
        }

        // RESET VÀ TRẢI BÀI MỚI
        `;

content = content.replace(between, goodBetween);

// Validate script
const match = content.match(/<script>([\s\S]*?)<\/script>/i);
if (!match) {
    console.error('ERROR: No script tag found!');
    process.exit(1);
}

try {
    new vm.Script(match[1], { filename: 'index.html' });
    console.log('Script validated successfully!');
} catch (e) {
    console.error('Validation failed:', e);
    process.exit(1);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('index.html updated and saved successfully!');
