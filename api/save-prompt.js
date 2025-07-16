import { saveConfig, getConfig, savePrompt } from './lib/database.js';

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
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { promptName, systemPrompt1, systemPrompt2, enableLogging, logTimestamps } = req.body;

    if (!promptName || !systemPrompt1 || !systemPrompt2) {
        return res.status(400).json({ error: 'Prompt name and system prompts are required' });
    }

    try {
        // Save the prompt configuration to database
        const promptConfig = {
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging !== undefined ? enableLogging : true,
            logTimestamps: logTimestamps !== undefined ? logTimestamps : true
        };

        // Save to prompts database
        const promptSaved = savePrompt(promptName, promptConfig);
        
        if (!promptSaved) {
            throw new Error('Failed to save prompt to database');
        }

        // Also apply this configuration immediately
        const configSaved = saveConfig(promptConfig);
        
        if (!configSaved) {
            throw new Error('Failed to apply configuration');
        }

        console.log(`Prompt "${promptName}" saved to database and applied`);

        res.status(200).json({
            success: true,
            message: `Prompt "${promptName}" saved successfully and applied`,
            promptName,
            config: promptConfig
        });
    } catch (error) {
        console.error('Error saving prompt:', error);
        res.status(500).json({ error: 'Failed to save prompt configuration: ' + error.message });
    }
}