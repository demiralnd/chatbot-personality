// DEPRECATED: This endpoint has been consolidated into /api/logs
// This file exists only to satisfy Vercel's deployment cache

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Return deprecation notice
    res.status(200).json({ 
        success: false,
        error: 'This endpoint has been consolidated into /api/logs',
        message: 'Please use /api/logs instead',
        redirect: '/api/logs'
    });
}