// Consolidated admin API - handles all admin operations
import { 
    getConfig, 
    saveConfig, 
    getChatLogs, 
    clearAllLogs
} from './lib/database.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Check authorization for admin operations
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'get-config':
                return await handleGetConfig(req, res);
            
            case 'set-config':
                return await handleSetConfig(req, res);
            
            case 'get-chat-logs':
                return handleGetChatLogs(req, res);
            
            case 'clear-logs':
                return handleClearLogs(req, res);
            
            case 'get-env-vars':
                return await handleGetEnvVars(req, res);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Configuration handlers
async function handleGetConfig(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const config = await getConfig();
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

async function handleSetConfig(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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
        
        console.log('🔄 [ADMIN] Attempting to save config:', JSON.stringify(config, null, 2));
        console.log('🔄 [ADMIN] systemPrompt1 length:', systemPrompt1.length);
        console.log('🔄 [ADMIN] systemPrompt2 length:', systemPrompt2.length);
        
        const saved = await saveConfig(config);
        
        if (saved) {
            console.log('✅ [ADMIN] Configuration saved successfully');
            res.status(200).json({
                success: true,
                message: 'Configuration saved successfully'
            });
        } else {
            console.error('❌ [ADMIN] saveConfig returned false');
            throw new Error('Failed to write configuration to storage');
        }
    } catch (error) {
        console.error('❌ [ADMIN] Error saving config:', error);
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to save configuration',
            details: error.message 
        });
    }
}

// Chat logs handlers
function handleGetChatLogs(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const chatLogs = getChatLogs();
        res.status(200).json({
            success: true,
            chatLogs
        });
    } catch (error) {
        console.error('Error retrieving chat logs:', error);
        res.status(500).json({ error: 'Failed to retrieve chat logs' });
    }
}

function handleClearLogs(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const cleared = clearAllLogs();
        
        if (cleared) {
            res.status(200).json({
                success: true,
                message: 'All chat logs cleared successfully'
            });
        } else {
            throw new Error('Failed to clear logs');
        }
    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).json({ error: 'Failed to clear chat logs' });
    }
}

// Environment variables helper
async function handleGetEnvVars(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const currentConfig = await getConfig();
        const envVars = {
            SYSTEM_PROMPT_1: currentConfig.systemPrompt1 || '',
            SYSTEM_PROMPT_2: currentConfig.systemPrompt2 || '',
            ENABLE_LOGGING: currentConfig.enableLogging || true,
            LOG_TIMESTAMPS: currentConfig.logTimestamps || true
        };

        res.status(200).json({
            success: true,
            message: 'Environment variables for Vercel deployment',
            envVars,
            instructions: [
                '1. Go to your Vercel dashboard',
                '2. Select your project',
                '3. Go to Settings > Environment Variables',
                '4. Add each variable with its value',
                '5. Redeploy your project'
            ]
        });
    } catch (error) {
        console.error('Error getting env vars:', error);
        res.status(500).json({ error: 'Failed to get environment variables' });
    }
}

