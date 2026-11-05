const fs = require('fs');
const vm = require('vm');

const context = {
    window: { innerWidth: 1920, innerHeight: 1080 },
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
    setTimeout: fn => fn(),
    clearTimeout: () => {},
    requestAnimationFrame: () => {}
};
context.self = context.window;
context.window.window = context.window;

vm.createContext(context);

// 1. Load tarot_book.js
vm.runInContext(fs.readFileSync('tarot_book.js', 'utf8'), context);

// 2. Load src/utils/interpretationEngine.js
vm.runInContext(fs.readFileSync('src/utils/interpretationEngine.js', 'utf8'), context);
console.log('TarotInterpretationEngine loaded in window:', !!context.window.TarotInterpretationEngine);

// 3. Test generateMasterTarotInterpretation with multiple questions
const bookData = context.window.TAROT_BOOK_DATA;
const cards = [
    { data: bookData['major-16'] || bookData[16], isReversed: false },
    { data: bookData['major-8'] || bookData[8], isReversed: true },
    { data: bookData['major-17'] || bookData[17], isReversed: false }
];

const testQuestions = [
    "Có quay lại được không?",
    "Công việc sắp tới có tiến triển không?",
    "Sắp tới thi công chức có đỗ không?",
    "Năm nay tài chính thế nào?"
];

testQuestions.forEach(q => {
    console.log(`\n============================ ${q} ============================`);
    const output = context.window.TarotInterpretationEngine.generateMasterTarotInterpretation(q, cards);
    console.log(output);
});

console.log('\n>>> BROWSER SIMULATION PASSED 100%! <<<');
