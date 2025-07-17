// Session management API
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

    const { chatbotId, action } = req.body;

    if (action === 'start') {
        try {
            // Get IP address
            const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown';
            const userAgent = req.headers['user-agent'] || 'Unknown';
            
            // Create session ID based on IP, chatbot, and timestamp
            const timestamp = new Date().toISOString();
            const sessionId = `${ipAddress}-chatbot${chatbotId}-${Date.now()}`;
            
            console.log('Session started:', {
                sessionId,
                ipAddress,
                chatbotId,
                timestamp
            });
            
            res.status(200).json({
                success: true,
                sessionId,
                ipAddress,
                userAgent,
                timestamp
            });
        } catch (error) {
            console.error('Session initialization error:', error);
            res.status(500).json({ error: 'Failed to initialize session' });
        }
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
}