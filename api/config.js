// Consolidated config API - handles API key and public configuration
import { getConfig } from './lib/database.js';

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
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'api-key':
                return handleGetApiKey(req, res);
            
            case 'config':
                return handleGetConfig(req, res);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Config API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function handleGetApiKey(req, res) {
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

function handleGetConfig(req, res) {
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