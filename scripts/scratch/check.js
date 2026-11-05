const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 650; i <= 760; i++) {
    console.log(`${i}: ${lines[i-1]}`);
}
