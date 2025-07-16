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
        // Check if API key is configured without exposing it
        const globalApiKey = process.env.GROQ_API_KEY || '';
        
        if (!globalApiKey) {
            res.status(404).json({ error: 'Global API key not configured' });
            return;
        }

        // Return success without exposing the actual API key
        res.status(200).json({ 
            success: true, 
            apiKey: 'configured' // Don't expose the actual key
        });
    } catch (error) {
        console.error('Error checking API key configuration:', error);
        res.status(500).json({ error: 'Failed to check API key configuration' });
    }
}