import { getConfig, saveChatLog } from './lib/database.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { messages, chatbotId } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: 'Messages array is required' });
            return;
        }

        // Get API key from environment variable
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            res.status(500).json({ error: 'Server configuration error: API key not set' });
            return;
        }

        // Get configuration from server storage
        const config = await getConfig();
        const systemPrompt = chatbotId === 2 ? config.systemPrompt2 : config.systemPrompt1;

        // Prepare messages with system prompt
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API error:', errorData);
            res.status(response.status).json({ 
                error: errorData.error?.message || `API error: ${response.status}` 
            });
            return;
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        // Log the conversation if logging is enabled - store full session with IP tracking
        if (config.enableLogging) {
            const userMessage = messages[messages.length - 1]; // Get the latest user message
            const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown';
            const sessionId = req.headers['session-id'] || `${ipAddress}-chatbot${chatbotId}-${Date.now()}`;
            
            const logEntry = {
                chatbotId,
                chatbotName: `Chatbot ${chatbotId}`,
                title: userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : ''),
                messages: [...messages, { role: 'assistant', content: assistantMessage }],
                userAgent: req.headers['user-agent'],
                ipAddress: ipAddress,
                sessionId: sessionId
            };
            await saveChatLog(logEntry);
        }

        res.status(200).json({ 
            success: true, 
            message: assistantMessage 
        });

    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}