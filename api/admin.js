// Consolidated admin API - handles all admin operations
import { 
    getConfig, 
    saveConfig, 
    getChatLogs, 
    clearAllLogs,
    getSavedPrompts,
    savePrompt,
    deletePrompt
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
                return handleGetConfig(req, res);
            
            case 'set-config':
                return handleSetConfig(req, res);
            
            case 'get-chat-logs':
                return handleGetChatLogs(req, res);
            
            case 'clear-logs':
                return handleClearLogs(req, res);
            
            case 'get-prompts':
                return handleGetPrompts(req, res);
            
            case 'save-prompt':
                return handleSavePrompt(req, res);
            
            case 'load-prompt':
                return handleLoadPrompt(req, res);
            
            case 'delete-prompt':
                return handleDeletePrompt(req, res);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Configuration handlers
function handleGetConfig(req, res) {
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

function handleSetConfig(req, res) {
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

// Prompt management handlers
function handleGetPrompts(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const savedPrompts = getSavedPrompts();
        
        const promptList = Object.keys(savedPrompts).map(name => ({
            name,
            ...savedPrompts[name]
        }));

        promptList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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

function handleSavePrompt(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { promptName, systemPrompt1, systemPrompt2, enableLogging, logTimestamps } = req.body;

    if (!promptName || !systemPrompt1 || !systemPrompt2) {
        return res.status(400).json({ error: 'Prompt name and system prompts are required' });
    }

    try {
        const promptConfig = {
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging !== undefined ? enableLogging : true,
            logTimestamps: logTimestamps !== undefined ? logTimestamps : true
        };

        const promptSaved = savePrompt(promptName, promptConfig);
        
        if (!promptSaved) {
            throw new Error('Failed to save prompt to database');
        }

        const configSaved = saveConfig(promptConfig);
        
        if (!configSaved) {
            throw new Error('Failed to apply configuration');
        }

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

function handleLoadPrompt(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { promptName } = req.body;

    if (!promptName) {
        return res.status(400).json({ error: 'Prompt name is required' });
    }

    try {
        const savedPrompts = getSavedPrompts();
        const promptConfig = savedPrompts[promptName];
        
        if (!promptConfig) {
            return res.status(404).json({ error: `Prompt "${promptName}" not found` });
        }

        const configToApply = {
            systemPrompt1: promptConfig.systemPrompt1,
            systemPrompt2: promptConfig.systemPrompt2,
            enableLogging: promptConfig.enableLogging,
            logTimestamps: promptConfig.logTimestamps
        };

        const saved = saveConfig(configToApply);

        if (saved) {
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
        res.status(500).json({ error: 'Failed to load prompt configuration: ' + error.message });
    }
}

function handleDeletePrompt(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { promptName } = req.body;

    if (!promptName) {
        return res.status(400).json({ error: 'Prompt name is required' });
    }

    try {
        const deleted = deletePrompt(promptName);

        if (deleted) {
            res.status(200).json({
                success: true,
                message: `Prompt "${promptName}" deleted successfully`
            });
        } else {
            res.status(404).json({ error: `Prompt "${promptName}" not found` });
        }
    } catch (error) {
        console.error('Error deleting prompt:', error);
        res.status(500).json({ error: 'Failed to delete prompt: ' + error.message });
    }
}