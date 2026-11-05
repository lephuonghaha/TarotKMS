const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

const functionsToCheck = [
    'openApiModal',
    'setQuickQuestion',
    'testGeminiApiKey',
    'saveApiKeyDirectly',
    'startTarotJourney',
    'activateAiFromResults',
    'resetToNewReading',
    'copyFullReading',
    'saveApiKey',
    'closeApiModal',
    'showToast',
    'getSavedApiKey'
];

functionsToCheck.forEach(fn => {
    const hasDef = new RegExp(`function\\s+${fn}\\b`).test(content) || new RegExp(`window\\.${fn}\\b`).test(content);
    console.log(`Function ${fn}: ${hasDef ? 'EXISTS' : 'MISSING'}`);
});
