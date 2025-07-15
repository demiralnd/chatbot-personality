export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // For now, return the API key from environment variable
        // In production, this should be stored in a secure database
        const globalApiKey = process.env.GROQ_API_KEY || '';
        
        if (!globalApiKey) {
            res.status(404).json({ error: 'Global API key not configured' });
            return;
        }

        res.status(200).json({ 
            success: true, 
            apiKey: globalApiKey 
        });
    } catch (error) {
        console.error('Error retrieving global API key:', error);
        res.status(500).json({ error: 'Failed to retrieve global API key' });
    }
}