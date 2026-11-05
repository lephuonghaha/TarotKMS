const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const tarotBook = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'tarot_book.json'), 'utf8'));
const images = {};

for (const card of tarotBook) {
    const relPath = card.image;
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
        const ext = path.extname(relPath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        const b64 = fs.readFileSync(fullPath).toString('base64');
        images[relPath] = 'data:' + mime + ';base64,' + b64;
    }
}

// Mặt sau lá bài
const backPath = path.join(ROOT_DIR, 'assets', 'back.png');
if (fs.existsSync(backPath)) {
    const b64 = fs.readFileSync(backPath).toString('base64');
    const dataUri = 'data:image/png;base64,' + b64;
    images['assets/back.png'] = dataUri;
    images['back.png'] = dataUri; // Fallback alias
}

// Hiệu ứng ngôi sao lấp lánh
const sparklePath = path.join(ROOT_DIR, 'assets', 'sparkle.png');
if (fs.existsSync(sparklePath)) {
    const b64 = fs.readFileSync(sparklePath).toString('base64');
    const dataUri = 'data:image/png;base64,' + b64;
    images['assets/sparkle.png'] = dataUri;
    images['sparkle.png'] = dataUri; // Fallback alias
}

const jsContent = '// Asset data URI cache for seamless offline / file:// protocol\n(function(root) {\n    var data = ' + JSON.stringify(images) + ';\n    root.CARD_IMAGE_DATA = data;\n    if (typeof module !== "undefined" && module.exports) module.exports = data;\n})(typeof window !== "undefined" ? window : globalThis);\n';
fs.writeFileSync(path.join(__dirname, 'card_images.js'), jsContent, 'utf8');
console.log('Successfully generated card_images.js! Key count:', Object.keys(images).length);
