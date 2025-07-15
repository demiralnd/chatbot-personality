// Vercel serverless function for retrieving chat logs (for admin panel)
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Simple authentication check (in production, use proper JWT or session auth)
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== 'Bearer admin-token') {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // In production, retrieve from your database
        // For now, return empty array as we're just logging to console
        const logs = [];

        // Example of how you might retrieve from Vercel KV (Redis):
        // if (process.env.KV_REST_API_URL) {
        //     const { kv } = await import('@vercel/kv');
        //     const logEntries = await kv.lrange('chat_logs', 0, -1);
        //     logs = logEntries.map(entry => JSON.parse(entry));
        // }

        res.status(200).json({
            success: true,
            logs: logs,
            count: logs.length
        });

    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}