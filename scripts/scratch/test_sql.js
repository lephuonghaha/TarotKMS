const fs = require('fs');
const sql = fs.readFileSync('04-Database/Sample_Data.sql', 'utf8');

const lines = sql.split('\n');
const insertCardLines = lines.filter(l => l.startsWith('INSERT INTO `TarotCard`'));
console.log('Total TarotCard INSERT lines:', insertCardLines.length);

const cardIds = new Set();
insertCardLines.forEach((line, idx) => {
  const match = line.match(/VALUES \('([^']+)'/);
  if (!match) {
    console.error('Failed to parse card_id at line:', idx);
  } else {
    cardIds.add(match[1]);
  }
});
console.log('Unique card IDs inserted:', cardIds.size);

// Check if all 78 IDs exist
const bookCards = JSON.parse(fs.readFileSync('tarot_book.json', 'utf8'));
const missingIds = bookCards.filter(c => !cardIds.has(c.id));
console.log('Missing IDs compared to tarot_book.json:', missingIds.length);

// Check ReadingSession
const sessionLines = lines.filter(l => l.includes('INSERT INTO `ReadingSession`'));
console.log('ReadingSession INSERT lines:', sessionLines.length);

// Check foreign keys in session
['major-0', 'wands-1', 'major-1'].forEach(id => {
  if (!cardIds.has(id)) console.error('FK violation for:', id);
  else console.log('FK ok:', id);
});
