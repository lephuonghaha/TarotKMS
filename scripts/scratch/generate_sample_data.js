const fs = require('fs');
const path = require('path');

const bookJsonPath = path.join(__dirname, '..', 'tarot_book.json');
const outputPath = path.join(__dirname, '..', '04-Database', 'Sample_Data.sql');

const cards = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8'));

function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    const s = String(val)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
    return `'${s}'`;
}

let sql = `-- ==============================================================================
-- DỰ ÁN TAROT: TAROTCUAHALLE
-- FILE: Sample_Data.sql
-- MÔ TẢ: Dữ liệu mẫu (Seed Data) chuẩn MySQL cho hệ thống cơ sở dữ liệu Tarot
-- BAO GỒM: 
--   1. Bản ghi nguồn sách "Tarot Chú Giải" trong bảng KnowledgeSource
--   2. Trọn bộ 78 lá bài Tarot (22 Ẩn Chính + 56 Ẩn Phụ) trong bảng TarotCard
--   3. Bản ghi mẫu phiên trải bài trong bảng ReadingSession
-- BỘ MÃ KÝ TỰ: UTF-8 (utf8mb4 / utf8mb4_unicode_ci)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE \`tarot_db\`;

-- ------------------------------------------------------------------------------
-- 1. INSERT DỮ LIỆU NGUỒN SÁCH VÀO BẢNG: KnowledgeSource
-- ------------------------------------------------------------------------------
INSERT INTO \`KnowledgeSource\` (\`source_id\`, \`title\`, \`author\`, \`total_pages\`, \`deck_standard\`)
VALUES (
    'SRC_TAROT_CHU_GIAI',
    'Tarot Chú Giải',
    'Phùng Lâm',
    282,
    'Rider-Waite-Smith'
) ON DUPLICATE KEY UPDATE 
    \`title\` = VALUES(\`title\`),
    \`author\` = VALUES(\`author\`),
    \`total_pages\` = VALUES(\`total_pages\`),
    \`deck_standard\` = VALUES(\`deck_standard\`);

-- ------------------------------------------------------------------------------
-- 2. INSERT TOÀN BỘ 78 LÁ BÀI TAROT VÀO BẢNG: TarotCard (78 CÂU LỆNH CHUẨN MYSQL)
-- ------------------------------------------------------------------------------
`;

cards.forEach((c, index) => {
    const cardId = c.id;
    const sourceId = 'SRC_TAROT_CHU_GIAI';
    const nameEn = c.nameEn;
    const nameVi = c.nameVi;
    const arcanaType = c.arcana;
    
    // Suit / Element: For Minor use Suit capitalized (Wands, Cups, Swords, Pentacles), for Major use Element (Khí, Nước, Đất, Lửa)
    let suitElement = c.element;
    if (c.suit) {
        suitElement = c.suit.charAt(0).toUpperCase() + c.suit.slice(1);
    }
    
    const astrologyLink = c.astrology || '';
    const keywords = Array.isArray(c.keywords) ? c.keywords.join(', ') : (c.keywords || '');
    const uprightMeaning = c.upright || '';
    const reversedMeaning = c.reversed || '';
    
    let actionableAdvice = '';
    if (c.advice) {
        if (typeof c.advice === 'string') {
            actionableAdvice = c.advice;
        } else {
            const parts = [];
            if (c.advice.general) parts.push(`Lời khuyên chung: ${c.advice.general}`);
            if (c.advice.upright) parts.push(`- Chiều thuận: ${c.advice.upright}`);
            if (c.advice.reversed) parts.push(`- Chiều ngược: ${c.advice.reversed}`);
            actionableAdvice = parts.join('\n');
        }
    }
    
    const imagePath = c.image || '';

    sql += `-- [${index + 1}/78] ${c.id}: ${c.nameEn} (${c.nameVi})\n`;
    sql += `INSERT INTO \`TarotCard\` (\`card_id\`, \`source_id\`, \`name_en\`, \`name_vi\`, \`arcana_type\`, \`suit_element\`, \`astrology_link\`, \`keywords\`, \`upright_meaning\`, \`reversed_meaning\`, \`actionable_advice\`, \`image_path\`) ` +
           `VALUES (${escapeSql(cardId)}, ${escapeSql(sourceId)}, ${escapeSql(nameEn)}, ${escapeSql(nameVi)}, ${escapeSql(arcanaType)}, ${escapeSql(suitElement)}, ${escapeSql(astrologyLink)}, ${escapeSql(keywords)}, ${escapeSql(uprightMeaning)}, ${escapeSql(reversedMeaning)}, ${escapeSql(actionableAdvice)}, ${escapeSql(imagePath)}) ` +
           `ON DUPLICATE KEY UPDATE \`source_id\` = VALUES(\`source_id\`), \`name_en\` = VALUES(\`name_en\`), \`name_vi\` = VALUES(\`name_vi\`), \`arcana_type\` = VALUES(\`arcana_type\`), \`suit_element\` = VALUES(\`suit_element\`), \`astrology_link\` = VALUES(\`astrology_link\`), \`keywords\` = VALUES(\`keywords\`), \`upright_meaning\` = VALUES(\`upright_meaning\`), \`reversed_meaning\` = VALUES(\`reversed_meaning\`), \`actionable_advice\` = VALUES(\`actionable_advice\`), \`image_path\` = VALUES(\`image_path\`);\n\n`;
});

sql += `-- ------------------------------------------------------------------------------
-- 3. INSERT BẢN GHI MẪU PHIÊN TRẢI BÀI VÀO BẢNG: ReadingSession
-- ------------------------------------------------------------------------------
INSERT INTO \`ReadingSession\` (
    \`session_id\`,
    \`user_question\`,
    \`topic\`,
    \`card_1_id\`,
    \`card_2_id\`,
    \`card_3_id\`,
    \`reading_result\`,
    \`created_at\`
) VALUES (
    'session-sample-demo-01',
    'Tôi nên chuẩn bị tâm thế như thế nào để đón nhận dự án công việc mới?',
    'work',
    'major-0',
    'wands-1',
    'major-1',
    'Trải bài mang thông điệp tích cực mạnh mẽ: Lá 1 (The Fool) đại diện cho bước khởi đầu đầy tự do và hào hứng; Lá 2 (Ace of Wands) biểu thị ngọn lửa nhiệt huyết và sáng tạo bùng cháy; Lá 3 (The Magician) khẳng định bạn đã hội tụ đầy đủ kỹ năng và công cụ để biến ý tưởng thành hiện thực.',
    NOW()
) ON DUPLICATE KEY UPDATE
    \`user_question\` = VALUES(\`user_question\`),
    \`topic\` = VALUES(\`topic\`),
    \`reading_result\` = VALUES(\`reading_result\`);

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${outputPath} with individual INSERT statements for ${cards.length} cards successfully.`);
