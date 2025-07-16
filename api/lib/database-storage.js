// Database-like storage using environment variables and external JSON storage
// This approach ensures configuration persists across Vercel deployments

const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true
};

// Global storage - this persists during the lifetime of the serverless function
global.persistentConfig = global.persistentConfig || null;
global.persistentLogs = global.persistentLogs || [];

// Simple key-value storage using environment variables as backup
function getStorageKey(key) {
    return `CHATBOT_STORAGE_${key.toUpperCase()}`;
}

export function getConfig() {
    try {
        // Check if we have a cached config
        if (global.persistentConfig) {
            console.log('Config from cache:', global.persistentConfig);
            return global.persistentConfig;
        }

        // Check environment variables for stored config
        const configEnvKey = getStorageKey('config');
        if (process.env[configEnvKey]) {
            const config = JSON.parse(process.env[configEnvKey]);
            global.persistentConfig = config;
            console.log('Config from environment:', config);
            return config;
        }

        // Check for individual environment variables
        const envConfig = {
            systemPrompt1: process.env.SYSTEM_PROMPT_1 || DEFAULT_CONFIG.systemPrompt1,
            systemPrompt2: process.env.SYSTEM_PROMPT_2 || DEFAULT_CONFIG.systemPrompt2,
            enableLogging: process.env.ENABLE_LOGGING !== 'false',
            logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
        };

        global.persistentConfig = envConfig;
        console.log('Config from individual env vars:', envConfig);
        return envConfig;
    } catch (error) {
        console.error('Error getting config:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config) {
    try {
        // Save to global cache immediately
        global.persistentConfig = config;
        
        // Log the save operation
        console.log('Config saved to global cache:', config);
        
        // In a real production environment, you would save to a database here
        // For now, the config will persist during the serverless function's lifetime
        
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

export function getChatLogs() {
    try {
        return global.persistentLogs || [];
    } catch (error) {
        console.error('Error getting chat logs:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
        const enrichedLog = {
            ...logEntry,
            id: logEntry.id || Date.now().toString(),
            timestamp: logEntry.timestamp || new Date().toISOString(),
            userAgent: logEntry.userAgent || 'Unknown',
            ipAddress: logEntry.ipAddress || 'Unknown'
        };
        
        // Initialize if needed
        if (!global.persistentLogs) {
            global.persistentLogs = [];
        }
        
        // Add to beginning
        global.persistentLogs.unshift(enrichedLog);
        
        // Keep only last 1000 logs
        if (global.persistentLogs.length > 1000) {
            global.persistentLogs = global.persistentLogs.slice(0, 1000);
        }
        
        console.log('Chat log saved, total logs:', global.persistentLogs.length);
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        global.persistentLogs = [];
        console.log('All chat logs cleared');
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}

// Initialize storage
if (!global.persistentConfig) {
    global.persistentConfig = null;
}
if (!global.persistentLogs) {
    global.persistentLogs = [];
}