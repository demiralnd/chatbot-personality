import { getConfig } from './lib/database.js';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const config = getConfig();
        
        res.status(200).json({
            success: true,
            config
        });
    } catch (error) {
        console.error('Error getting config:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve configuration',
            success: false 
        });
    }
}