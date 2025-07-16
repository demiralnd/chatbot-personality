import fs from 'fs';
import path from 'path';

// For Vercel, we'll use a combination of approaches:
// 1. Environment variables for initial/default config
// 2. A simple JSON file in the project root for dynamic updates
// 3. Global memory as a cache layer

const CONFIG_FILE = path.join(process.cwd(), 'chatbot-config.json');
const LOGS_FILE = path.join(process.cwd(), 'chat-logs.json');

// Default configuration
const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true
};

// Initialize global cache
global.configCache = global.configCache || null;
global.logsCache = global.logsCache || null;

// Configuration functions
export function getConfig() {
    try {
        // First check cache
        if (global.configCache) {
            console.log('Returning config from cache');
            return global.configCache;
        }

        // Try to read from file
        if (fs.existsSync(CONFIG_FILE)) {
            const fileData = fs.readFileSync(CONFIG_FILE, 'utf8');
            const config = JSON.parse(fileData);
            global.configCache = config;
            console.log('Config loaded from file:', config);
            return config;
        }

        // Check environment variables
        if (process.env.CHATBOT_CONFIG) {
            const envConfig = JSON.parse(process.env.CHATBOT_CONFIG);
            global.configCache = envConfig;
            console.log('Config loaded from environment');
            return envConfig;
        }

        // Return defaults
        console.log('Using default config');
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error reading config:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config) {
    try {
        // Save to file
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        
        // Update cache
        global.configCache = config;
        
        console.log('Config saved to file and cache:', config);
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        // Fallback to memory only
        global.configCache = config;
        console.log('Config saved to cache only (file write failed)');
        return true; // Still return true as we saved to cache
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        // First check cache
        if (global.logsCache) {
            return global.logsCache;
        }

        // Try to read from file
        if (fs.existsSync(LOGS_FILE)) {
            const fileData = fs.readFileSync(LOGS_FILE, 'utf8');
            const logs = JSON.parse(fileData);
            global.logsCache = logs;
            return logs;
        }

        // Return empty array
        global.logsCache = [];
        return [];
    } catch (error) {
        console.error('Error reading chat logs:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
        // Get current logs
        const logs = getChatLogs();
        
        // Add metadata
        const enrichedLog = {
            ...logEntry,
            id: logEntry.id || Date.now().toString(),
            timestamp: logEntry.timestamp || new Date().toISOString(),
            userAgent: logEntry.userAgent || 'Unknown',
            ipAddress: logEntry.ipAddress || 'Unknown'
        };
        
        // Add to beginning
        logs.unshift(enrichedLog);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(1000);
        }
        
        // Save to file
        try {
            fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
        } catch (fileError) {
            console.error('Failed to write logs to file:', fileError);
        }
        
        // Update cache
        global.logsCache = logs;
        
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        // Clear file
        try {
            fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
        } catch (fileError) {
            console.error('Failed to clear logs file:', fileError);
        }
        
        // Clear cache
        global.logsCache = [];
        
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}

// Initialize storage on first load
try {
    // Create files if they don't exist
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
    if (!fs.existsSync(LOGS_FILE)) {
        fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
    }
} catch (error) {
    console.error('Error initializing storage files:', error);
}