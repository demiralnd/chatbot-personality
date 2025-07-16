// Consolidated logs API - handles all logging operations
import { saveChatLog, getChatLogs } from './lib/database.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'save':
                return handleSaveChatLog(req, res);
            
            case 'get':
                return handleGetLogs(req, res);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Logs API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function handleSaveChatLog(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, chatbotId, chatbotName, title, timestamp, messages } = req.body;

    // Validate required fields
    if (!chatbotId || !messages || !timestamp || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Missing required fields or invalid session data' });
        return;
    }

    try {
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

function handleGetLogs(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const logs = getChatLogs();
        res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
}