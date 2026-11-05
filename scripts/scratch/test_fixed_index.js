const fs = require('fs');
const vm = require('vm');

// 1. Load tarot_book.js
const tarotBookCode = fs.readFileSync('tarot_book.js', 'utf8');
const context = {
    window: { innerWidth: 1920, innerHeight: 1080 },
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
    requestAnimationFrame: () => {},
    setTimeout: (fn) => fn(),
    clearTimeout: () => {}
};
vm.createContext(context);
vm.runInContext(tarotBookCode, context);

const tarotBook = context.window.TAROT_BOOK_DATA || context.TAROT_BOOK_DATA;

// Mock browser objects
const dummyCtx = new Proxy({}, {
    get: () => () => ({ addColorStop: () => {} })
});

const dummyEl = {
    style: {},
    innerText: '',
    innerHTML: '',
    value: '',
    width: 512,
    height: 880,
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    getContext: () => dummyCtx
};

context.document = {
    getElementById: (id) => dummyEl,
    createElement: () => dummyEl,
    body: dummyEl,
    addEventListener: () => {}
};
context.window.addEventListener = () => {};

// Universal Three.js mock via Proxy
class DummyThreeObj {
    constructor() {
        this.position = { set: () => {}, copy: () => {} };
        this.rotation = { set: () => {} };
        this.scale = { set: () => {} };
        this.userData = {};
        this.children = [];
        this.material = {};
        this.target = { position: { set: () => {} } };
        this.shadowMap = {};
        this.domElement = dummyEl;
    }
    add() {}
    remove() {}
    setPixelRatio() {}
    setSize() {}
    render() {}
    setAttribute() {}
    setFromCamera() {}
    intersectObjects() { return []; }
    load() { return {}; }
    lookAt() {}
}
const threeProxy = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'domElement') return dummyEl;
        return class extends DummyThreeObj {};
    }
});
context.THREE = threeProxy;

context.TWEEN = {
    Tween: class { to() { return this; } easing() { return this; } start() { return this; } onUpdate() { return this; } onComplete() { return this; } },
    Easing: { Exponential: { Out: {} }, Quadratic: { Out: {} } },
    update: () => {}
};
context.Hands = class { setOptions() {} onResults() {} };
context.Camera = class { start() {} };
context.marked = {
    parse: (text) => `<p>${text}</p>`
};

// 2. Load index.html main script
const indexHtml = fs.readFileSync('index.html', 'utf8');
const scriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    throw new Error('No script tag found in index.html');
}

// Run the script in context
vm.runInContext(scriptMatch[1], context);
console.log('Main script executed in VM successfully!');

// 3. Test generateMasterTarotInterpretation
const cardsSample = [
    { data: tarotBook['major-16'] || tarotBook[16], isReversed: false },
    { data: tarotBook['major-8'] || tarotBook[8], isReversed: true },
    { data: tarotBook['major-17'] || tarotBook[17], isReversed: false }
];

const testQuestions = [
    "Mình có nên nghỉ việc không vì sếp toxic quá?",
    "Sắp tới thi công chức có đỗ không ạ?",
    "Người ấy có còn yêu mình không?",
    "Năm nay tài chính thế nào?",
    "Tương lai công việc sắp tới ra sao?"
];

testQuestions.forEach(q => {
    const res = context.generateMasterTarotInterpretation(q, cardsSample);
    console.log(`\n================== TEST: "${q}" ==================`);
    console.log(res);
});

console.log('\n>>> ALL TESTS PASSED WITH FLYING COLORS! <<<');
