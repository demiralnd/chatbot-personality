import { saveChatLog } from './lib/database.js';

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

        // Log session data to server storage
        const sessionLogEntry = {
            id: id || Date.now().toString(),
            chatbotId,
            chatbotName: chatbotName || `Chatbot ${chatbotId}`,
            title: title || 'Untitled Session',
            timestamp,
            messageCount: messages.length,
            messages,
            ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown'
        };

        // Save to server storage
        const saved = saveChatLog(sessionLogEntry);

        if (saved) {
            res.status(200).json({ 
                success: true, 
                message: 'Chat session logged successfully',
                sessionId: sessionLogEntry.id
            });
        } else {
            throw new Error('Failed to save chat log');
        }

    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}