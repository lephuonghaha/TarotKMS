const engine = require('../src/utils/interpretationEngine.js');
console.log('Engine loaded successfully. Exports:', Object.keys(engine));

const bookData = require('../tarot_book.json');
const testCards = [
    { data: bookData['major-16'] || bookData[16], isReversed: false },
    { data: bookData['major-8'] || bookData[8], isReversed: true },
    { data: bookData['major-17'] || bookData[17], isReversed: false }
];

const reading = engine.generateMasterTarotInterpretation("Có quay lại được không?", testCards);
console.log('\n--- SAMPLE READING OUTPUT ---');
console.log(reading);
