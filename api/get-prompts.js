import { getSavedPrompts } from './lib/database.js';

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

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Get all saved prompts from database
        const savedPrompts = getSavedPrompts();
        
        // Convert to array for easier handling
        const promptList = Object.keys(savedPrompts).map(name => ({
            name,
            ...savedPrompts[name]
        }));

        // Sort by updated date (newest first)
        promptList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        console.log(`Retrieved ${promptList.length} prompts from database`);

        res.status(200).json({
            success: true,
            prompts: promptList,
            count: promptList.length
        });
    } catch (error) {
        console.error('Error getting prompts:', error);
        res.status(500).json({ error: 'Failed to retrieve saved prompts: ' + error.message });
    }
}