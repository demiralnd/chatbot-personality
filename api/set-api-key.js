export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Check admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        res.status(401).json({ error: 'Unauthorized. Admin access required.' });
        return;
    }

    try {
        const { apiKey } = req.body;
        
        if (!apiKey || typeof apiKey !== 'string') {
            res.status(400).json({ error: 'Valid API key is required' });
            return;
        }

        // For demonstration, we'll just validate the key format
        // In production, you would store this in a secure database
        if (!apiKey.startsWith('gsk_')) {
            res.status(400).json({ error: 'Invalid Groq API key format' });
            return;
        }

        // Here you would store the API key in your database
        // For now, we'll just confirm it was received
        console.log('Global API key updated by admin');

        res.status(200).json({ 
            success: true, 
            message: 'Global API key updated successfully' 
        });
    } catch (error) {
        console.error('Error setting global API key:', error);
        res.status(500).json({ error: 'Failed to set global API key' });
    }
}