import { saveConfig, getConfig } from './lib/vercel-storage.js';

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
        // Get current config to preserve other settings
        const currentConfig = getConfig();
        
        // Initialize saved prompts if they don't exist
        if (!global.chatbotStorage) {
            global.chatbotStorage = { config: null, logs: [], savedPrompts: {} };
        }
        if (!global.chatbotStorage.savedPrompts) {
            global.chatbotStorage.savedPrompts = {};
        }

        // Save the prompt configuration
        const promptConfig = {
            name: promptName,
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging !== undefined ? enableLogging : true,
            logTimestamps: logTimestamps !== undefined ? logTimestamps : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        global.chatbotStorage.savedPrompts[promptName] = promptConfig;

        // Also apply this configuration immediately
        const newConfig = {
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging !== undefined ? enableLogging : true,
            logTimestamps: logTimestamps !== undefined ? logTimestamps : true
        };

        saveConfig(newConfig);

        console.log(`Prompt "${promptName}" saved and applied:`, promptConfig);

        res.status(200).json({
            success: true,
            message: `Prompt "${promptName}" saved successfully and applied`,
            promptName,
            config: promptConfig
        });
    } catch (error) {
        console.error('Error saving prompt:', error);
        res.status(500).json({ error: 'Failed to save prompt configuration' });
    }
}