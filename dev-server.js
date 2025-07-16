import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

// Import your API handlers
import adminHandler from './api/admin.js';
import chatHandler from './api/chat.js';
import configHandler from './api/config.js';
import logsHandler from './api/logs.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle API routes
    if (pathname.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                if (body) {
                    req.body = JSON.parse(body);
                }
                req.query = parsedUrl.query;

                if (pathname === '/api/admin') {
                    await adminHandler(req, res);
                } else if (pathname === '/api/chat') {
                    await chatHandler(req, res);
                } else if (pathname === '/api/config') {
                    await configHandler(req, res);
                } else if (pathname === '/api/logs') {
                    await logsHandler(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'API endpoint not found' }));
                }
            } catch (error) {
                console.error('API Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
        return;
    }

    // Handle static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(process.cwd(), filePath);

    try {
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const contentType = getContentType(ext);
            
            const content = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
        }
    } catch (error) {
        console.error('File Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>');
    }
});

function getContentType(ext) {
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
    };
    return types[ext] || 'text/plain';
}

server.listen(PORT, () => {
    console.log(`🚀 Development server running at http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin.html`);
});