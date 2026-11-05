/**
 * server.js
 * Local HTTP Web Server & AI Tarot Interpretation Backend
 * 
 * Endpoints:
 * - GET  /*                     : Phục vụ file tĩnh (index.html, assets, scripts, src)
 * - GET  /api/status            : Kiểm tra cấu hình API Key và trạng thái hệ thống
 * - GET  /api/tarot/cards       : Lấy toàn bộ dữ liệu 78 lá bài từ sách số hóa
 * - POST /api/tarot/interpret   : Luận giải 3 lá bài Tarot theo câu hỏi với AI chuyên sâu
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { interpretTarotSpread, getTarotBookData, loadEnv } = require('../src/services/tarotAiService');

// Nạp cấu hình từ .env nếu có
loadEnv();

const PORT = process.env.PORT || 3456;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 5 * 1024 * 1024) { // Giới hạn 5MB
                req.connection.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body.trim()) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(new Error('Invalid JSON body: ' + e.message));
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Add CORS headers cho mọi response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // ==========================================
    // 1. API BACKEND ROUTES
    // ==========================================

    // GET /api/status: Kiểm tra trạng thái cấu hình AI
    if (req.method === 'GET' && pathname === '/api/status') {
        const geminiKey = process.env.GEMINI_API_KEY || '';
        const openaiKey = process.env.OPENAI_API_KEY || '';
        return sendJson(res, 200, {
            online: true,
            port: PORT,
            activeProvider: process.env.AI_PROVIDER || (geminiKey ? 'gemini' : (openaiKey ? 'openai' : 'offline')),
            geminiConfigured: !!geminiKey,
            geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
            openAiConfigured: !!openaiKey,
            openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            offlineEngineReady: true
        });
    }

    // GET /api/tarot/cards: Trả về danh sách lá bài đầy đủ
    if (req.method === 'GET' && pathname === '/api/tarot/cards') {
        const cards = getTarotBookData();
        return sendJson(res, 200, {
            total: cards.length,
            cards
        });
    }

    // POST /api/tarot/interpret: Luận giải 3 lá bài với AI
    if (req.method === 'POST' && pathname === '/api/tarot/interpret') {
        try {
            const body = await parseBody(req);
            const { userQuestion, cards, provider, model, apiKey } = body;

            if (!cards || !Array.isArray(cards) || cards.length < 3) {
                return sendJson(res, 400, {
                    success: false,
                    error: 'Yêu cầu cung cấp mảng "cards" chứa tối thiểu 3 lá bài (kèm thông tin id hoặc name và isReversed).'
                });
            }

            console.log(`[API /interpret] Nhận câu hỏi: "${userQuestion || 'Mặc định'}"`);
            const interpretation = await interpretTarotSpread({
                userQuestion,
                cards,
                provider,
                model,
                apiKey
            });

            return sendJson(res, 200, interpretation);
        } catch (err) {
            console.error('[API /interpret] Lỗi xử lý:', err.message);
            return sendJson(res, 500, {
                success: false,
                error: err.message || 'Lỗi máy chủ khi xử lý luận giải bài Tarot.'
            });
        }
    }

    // ==========================================
    // 2. STATIC FILES SERVING
    // ==========================================
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    let reqPath = pathname;
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.resolve(ROOT_DIR, '.' + reqPath);

    if (!filePath.startsWith(ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + reqPath);
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`====================================================`);
    console.log(`✦ TarotcuaHalle Server is running on: http://127.0.0.1:${PORT}`);
    console.log(`✦ Web Client:   http://127.0.0.1:${PORT}`);
    console.log(`✦ Status API:   http://127.0.0.1:${PORT}/api/status`);
    console.log(`✦ Interpret API: POST http://127.0.0.1:${PORT}/api/tarot/interpret`);
    console.log(`====================================================`);
});
