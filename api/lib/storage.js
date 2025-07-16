// Default configuration
const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true
};

// Use global memory for storage (persists across function calls in same instance)
global.chatbotConfig = global.chatbotConfig || null;
global.chatLogs = global.chatLogs || [];

// Configuration functions
export function getConfig() {
    try {
        // First check if we have a saved configuration in global memory
        if (global.chatbotConfig) {
            return global.chatbotConfig;
        }
        
        // Then check environment variables for initial config
        if (process.env.CHATBOT_CONFIG) {
            const envConfig = JSON.parse(process.env.CHATBOT_CONFIG);
            global.chatbotConfig = envConfig;
            return envConfig;
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
        // Save to global memory for immediate persistence
        global.chatbotConfig = config;
        
        // Log the config for debugging
        console.log('Config saved to global memory:', config);
        
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        // Return logs from global memory
        return global.chatLogs || [];
    } catch (error) {
        console.error('Error reading chat logs:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
        // Add metadata
        const enrichedLog = {
            ...logEntry,
            id: logEntry.id || Date.now().toString(),
            timestamp: logEntry.timestamp || new Date().toISOString(),
            userAgent: logEntry.userAgent || 'Unknown',
            ipAddress: logEntry.ipAddress || 'Unknown'
        };
        
        // Save to global memory
        global.chatLogs = global.chatLogs || [];
        global.chatLogs.unshift(enrichedLog);
        
        // Keep only last 1000 logs to prevent memory issues
        if (global.chatLogs.length > 1000) {
            global.chatLogs = global.chatLogs.slice(0, 1000);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        global.chatLogs = [];
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}