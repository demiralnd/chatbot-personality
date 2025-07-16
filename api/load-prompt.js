import { saveConfig } from './lib/vercel-storage.js';

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

    const { promptName } = req.body;

    if (!promptName) {
        return res.status(400).json({ error: 'Prompt name is required' });
    }

    try {
        // Initialize storage if needed
        if (!global.chatbotStorage) {
            global.chatbotStorage = { config: null, logs: [], savedPrompts: {} };
        }
        if (!global.chatbotStorage.savedPrompts) {
            global.chatbotStorage.savedPrompts = {};
        }

        // Check if prompt exists
        const promptConfig = global.chatbotStorage.savedPrompts[promptName];
        if (!promptConfig) {
            return res.status(404).json({ error: `Prompt "${promptName}" not found` });
        }

        // Load the configuration
        const configToApply = {
            systemPrompt1: promptConfig.systemPrompt1,
            systemPrompt2: promptConfig.systemPrompt2,
            enableLogging: promptConfig.enableLogging,
            logTimestamps: promptConfig.logTimestamps
        };

        // Apply the configuration
        const saved = saveConfig(configToApply);

        if (saved) {
            console.log(`Prompt "${promptName}" loaded and applied:`, configToApply);
            
            res.status(200).json({
                success: true,
                message: `Prompt "${promptName}" loaded successfully`,
                promptName,
                config: configToApply
            });
        } else {
            throw new Error('Failed to apply configuration');
        }
    } catch (error) {
        console.error('Error loading prompt:', error);
        res.status(500).json({ error: 'Failed to load prompt configuration' });
    }
}