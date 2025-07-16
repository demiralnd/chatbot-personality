// This file exists only to fix Vercel deployment cache issues
// All logging functionality has been moved to api/logs.js

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Redirect to the correct endpoint
    res.status(301).json({ 
        error: 'This endpoint has been moved to /api/logs',
        redirect: '/api/logs' 
    });
}