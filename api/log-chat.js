// Vercel serverless function for logging chat data
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { id, chatbotId, chatbotName, title, timestamp, messages } = req.body;

        // Validate required fields
        if (!chatbotId || !messages || !timestamp || !Array.isArray(messages)) {
            res.status(400).json({ error: 'Missing required fields or invalid session data' });
            return;
        }

        // Log session data (in production, you might want to store this in a database)
        const sessionLogEntry = {
            id: id || Date.now().toString(),
            chatbotId,
            chatbotName: chatbotName || `Chatbot ${chatbotId}`,
            title: title || 'Untitled Session',
            timestamp,
            messageCount: messages.length,
            messages,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        };

        // For development, just log to console
        // In production, you would store this in a database like:
        // - Vercel KV (Redis)
        // - Supabase
        // - Firebase
        // - MongoDB Atlas
        // - PostgreSQL
        
        console.log('Chat Session Log:', JSON.stringify(sessionLogEntry, null, 2));

        // Example of how you might store in Vercel KV (Redis):
        // if (process.env.KV_REST_API_URL) {
        //     const { kv } = await import('@vercel/kv');
        //     await kv.lpush('chat_sessions', JSON.stringify(sessionLogEntry));
        //     await kv.expire('chat_sessions', 86400 * 30); // 30 days
        // }

        res.status(200).json({ 
            success: true, 
            message: 'Chat session logged successfully',
            sessionId: sessionLogEntry.id
        });

    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}