import fs from 'fs';
import path from 'path';

// Use /tmp directory for Vercel serverless functions
const STORAGE_DIR = '/tmp';
const CONFIG_FILE = path.join(STORAGE_DIR, 'chatbot-config.json');
const LOGS_FILE = path.join(STORAGE_DIR, 'chat-logs.json');

// Default configuration
const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true
};

// Ensure storage directory exists
function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}

// Configuration functions
export function getConfig() {
    try {
        ensureStorageDir();
        
        // First check environment variables
        if (process.env.CHATBOT_CONFIG) {
            return JSON.parse(process.env.CHATBOT_CONFIG);
        }
        
        // Then check file system
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
        
        // Return defaults
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error reading config:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config) {
    try {
        ensureStorageDir();
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        ensureStorageDir();
        
        // First check environment variables
        if (process.env.CHAT_LOGS) {
            return JSON.parse(process.env.CHAT_LOGS);
        }
        
        // Then check file system
        if (fs.existsSync(LOGS_FILE)) {
            const data = fs.readFileSync(LOGS_FILE, 'utf8');
            return JSON.parse(data);
        }
        
        return [];
    } catch (error) {
        console.error('Error reading chat logs:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
        ensureStorageDir();
        const logs = getChatLogs();
        
        // Add metadata
        const enrichedLog = {
            ...logEntry,
            id: logEntry.id || Date.now().toString(),
            timestamp: logEntry.timestamp || new Date().toISOString(),
            userAgent: logEntry.userAgent || 'Unknown',
            ipAddress: logEntry.ipAddress || 'Unknown'
        };
        
        logs.unshift(enrichedLog);
        
        // Keep only last 1000 logs to prevent file from growing too large
        const trimmedLogs = logs.slice(0, 1000);
        
        fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmedLogs, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        ensureStorageDir();
        fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}