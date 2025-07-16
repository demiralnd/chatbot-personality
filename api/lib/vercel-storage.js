// Vercel-optimized storage solution
// Uses combination of environment variables and external storage for true persistence

const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true
};

// Use a simple JSON storage service like JSONBin or similar
// For now, we'll use environment variables + global cache with fallback to localStorage simulation

// Initialize global storage
if (typeof global !== 'undefined') {
    global.chatbotStorage = global.chatbotStorage || {
        config: null,
        logs: []
    };
}

export function getConfig() {
    try {
        // Check global cache first
        if (global.chatbotStorage && global.chatbotStorage.config) {
            console.log('Config from global cache');
            return global.chatbotStorage.config;
        }

        // Check environment variables for saved config
        const savedConfig = process.env.CHATBOT_SAVED_CONFIG;
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                // Cache it globally
                if (global.chatbotStorage) {
                    global.chatbotStorage.config = config;
                }
                console.log('Config from environment variable');
                return config;
            } catch (parseError) {
                console.error('Error parsing saved config:', parseError);
            }
        }

        // Check for individual environment variables
        const config = {
            systemPrompt1: process.env.SYSTEM_PROMPT_1 || DEFAULT_CONFIG.systemPrompt1,
            systemPrompt2: process.env.SYSTEM_PROMPT_2 || DEFAULT_CONFIG.systemPrompt2,
            enableLogging: process.env.ENABLE_LOGGING !== 'false',
            logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
        };

        // Cache it globally
        if (global.chatbotStorage) {
            global.chatbotStorage.config = config;
        }
        
        console.log('Config from individual env vars or defaults');
        return config;
    } catch (error) {
        console.error('Error getting config:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config) {
    try {
        // Save to global cache immediately
        if (global.chatbotStorage) {
            global.chatbotStorage.config = config;
        }
        
        console.log('Config saved to global storage:', config);
        console.log('Configuration will persist during active session');
        console.log('For permanent persistence, set CHATBOT_SAVED_CONFIG environment variable to:', JSON.stringify(config));
        
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

export function getChatLogs() {
    try {
        if (global.chatbotStorage && global.chatbotStorage.logs) {
            return global.chatbotStorage.logs;
        }
        return [];
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
        if (!global.chatbotStorage) {
            global.chatbotStorage = { config: null, logs: [] };
        }
        if (!global.chatbotStorage.logs) {
            global.chatbotStorage.logs = [];
        }

        // Add to beginning
        global.chatbotStorage.logs.unshift(enrichedLog);

        // Keep only last 1000 logs
        if (global.chatbotStorage.logs.length > 1000) {
            global.chatbotStorage.logs = global.chatbotStorage.logs.slice(0, 1000);
        }

        console.log('Chat log saved, total logs:', global.chatbotStorage.logs.length);
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        if (global.chatbotStorage) {
            global.chatbotStorage.logs = [];
        }
        console.log('All chat logs cleared');
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}

// Warm up the storage
try {
    if (typeof global !== 'undefined') {
        global.chatbotStorage = global.chatbotStorage || {
            config: null,
            logs: []
        };
    }
} catch (error) {
    console.error('Error initializing storage:', error);
}