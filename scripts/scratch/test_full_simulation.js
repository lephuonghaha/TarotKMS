const fs = require('fs');
const path = require('path');

// 1. Check tarot_book.json and tarot_book.js
const bookJson = JSON.parse(fs.readFileSync('tarot_book.json', 'utf8'));
console.log('tarot_book.json count:', bookJson.length);

const code = fs.readFileSync('tarot_book.js', 'utf8');
const win = {};
eval(code.replace('window.', 'win.'));
console.log('tarot_book.js count:', win.TAROT_BOOK_DATA.length);

// 2. Check engine
const engine = require(path.join(__dirname, '..', 'src', 'utils', 'interpretationEngine.js'));
const c1 = win.TAROT_BOOK_DATA.find(x => x.id === 'major-0');
const c2 = win.TAROT_BOOK_DATA.find(x => x.id === 'wands-1');
const c3 = win.TAROT_BOOK_DATA.find(x => x.id === 'major-1');

const reading = engine.generateMasterTarotInterpretation(
    'Công việc và sự nghiệp hiện tại có cơ hội bứt phá hoặc chuyển biến gì không?',
    [
        { data: c1, isReversed: false },
        { data: c2, isReversed: false },
        { data: c3, isReversed: false }
    ]
);

console.log('\n--- READING RESULT PREVIEW ---');
console.log(reading.substring(0, 1200));

// 3. Test grid item HTML generation logic from index.html
function renderCardItem(data, isRev, slotTitle) {
    let cardYesNo = (data.yes_no_result || 'MAYBE').toUpperCase();
    let yesNoBadgeClass = 'yesno-maybe';
    if (!isRev) {
        if (cardYesNo === 'YES') yesNoBadgeClass = 'yesno-yes';
        else if (cardYesNo === 'NO') yesNoBadgeClass = 'yesno-no';
    } else {
        if (cardYesNo === 'YES') cardYesNo = 'MAYBE (ĐẢO CHIỀU)';
        else if (cardYesNo === 'NO') cardYesNo = 'NO (CẢNH BÁO)';
        yesNoBadgeClass = (cardYesNo.startsWith('NO')) ? 'yesno-no' : 'yesno-maybe';
    }

    const meaningText = isRev ? (data.reversed || data.upright) : data.upright;

    return `
    <div class="card-card-item">
        <span class="card-position-tag">${slotTitle}</span>
        <span class="status-pill ${isRev ? 'reversed' : 'upright'}">${isRev ? '↺ CHIỀU NGƯỢC' : '✦ CHIỀU XUÔI'}</span>
        <h3 class="card-name-vi">${data.nameVi}</h3>
        <p class="card-name-en">${data.nameEn}</p>
        <div class="card-knowledge-box box-meaning">
            <div class="card-knowledge-title">📖 Ý Nghĩa Thực Tế (Tarot Chú Giải)</div>
            <div class="card-knowledge-content">${meaningText}</div>
        </div>
        <div class="card-knowledge-box box-yesno">
            <div class="card-knowledge-title">✨ Quyết Định Yes/No (Hành Trình Tarot)</div>
            <span class="yesno-badge ${yesNoBadgeClass}">${cardYesNo}</span>
            <div class="card-knowledge-content"><em>${data.yes_no_reason || ''}</em></div>
        </div>
        <div class="card-knowledge-box box-timing">
            <div class="card-knowledge-title">⏳ Mốc Thời Gian (Philippe Ngô)</div>
            <div class="card-knowledge-content"><strong>${data.time_prediction || 'Chưa xác định'}</strong></div>
        </div>
        ${data.archetype_story ? `
        <div class="card-knowledge-box box-archetype">
            <div class="card-knowledge-title">🏛️ Nguyên Mẫu Tâm Thức</div>
            <div class="card-knowledge-content">${data.archetype_story}</div>
        </div>` : ''}
    </div>`;
}

console.log('\n--- CARD 1 ITEM RENDERED HTML ---');
console.log(renderCardItem(c1, false, '✦ QUÁ KHỨ / CĂN NGUYÊN'));
console.log('\n--- CARD 2 ITEM RENDERED HTML (REVERSED) ---');
console.log(renderCardItem(c2, true, '✦ HIỆN TẠI / THỬ THÁCH'));
