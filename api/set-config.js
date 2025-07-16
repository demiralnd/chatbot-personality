import { saveConfig } from './lib/database.js';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { systemPrompt1, systemPrompt2, enableLogging, logTimestamps } = req.body;

    if (!systemPrompt1 || !systemPrompt2) {
        return res.status(400).json({ error: 'System prompts are required' });
    }

    try {
        const config = {
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging === true,
            logTimestamps: logTimestamps === true
        };
        
        const saved = saveConfig(config);
        
        if (saved) {
            res.status(200).json({
                success: true,
                message: 'Configuration saved successfully'
            });
        } else {
            throw new Error('Failed to write configuration');
        }
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
}