import fs from 'fs';
import path from 'path';

// Database files - these will be committed to the project
const DB_DIR = path.join(process.cwd(), 'database');
const CONFIG_DB = path.join(DB_DIR, 'config.json');
const LOGS_DB = path.join(DB_DIR, 'logs.json');
const PROMPTS_DB = path.join(DB_DIR, 'prompts.json');

// Default configuration
const DEFAULT_CONFIG = {
    systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
    enableLogging: true,
    logTimestamps: true,
    lastUpdated: new Date().toISOString()
};

// Initialize database directory and files
function initializeDatabase() {
    try {
        // Create database directory if it doesn't exist
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
            console.log('Database directory created');
        }

        // Initialize config file
        if (!fs.existsSync(CONFIG_DB)) {
            fs.writeFileSync(CONFIG_DB, JSON.stringify(DEFAULT_CONFIG, null, 2));
            console.log('Config database initialized');
        }

        // Initialize logs file
        if (!fs.existsSync(LOGS_DB)) {
            fs.writeFileSync(LOGS_DB, JSON.stringify([], null, 2));
            console.log('Logs database initialized');
        }

        // Initialize prompts file
        if (!fs.existsSync(PROMPTS_DB)) {
            fs.writeFileSync(PROMPTS_DB, JSON.stringify({}, null, 2));
            console.log('Prompts database initialized');
        }

        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

// Configuration functions
export function getConfig() {
    try {
        initializeDatabase();
        
        // Check environment variables first
        if (process.env.SYSTEM_PROMPT_1 && process.env.SYSTEM_PROMPT_2) {
            return {
                systemPrompt1: process.env.SYSTEM_PROMPT_1,
                systemPrompt2: process.env.SYSTEM_PROMPT_2,
                enableLogging: process.env.ENABLE_LOGGING !== 'false',
                logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
            };
        }

        // Read from database file
        const data = fs.readFileSync(CONFIG_DB, 'utf8');
        const config = JSON.parse(data);
        console.log('Config loaded from database:', config);
        return config;
    } catch (error) {
        console.error('Error reading config from database:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config) {
    try {
        initializeDatabase();
        
        const configWithTimestamp = {
            ...config,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(CONFIG_DB, JSON.stringify(configWithTimestamp, null, 2));
        console.log('Config saved to database:', configWithTimestamp);
        return true;
    } catch (error) {
        console.error('Error saving config to database:', error);
        return false;
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        initializeDatabase();
        
        const data = fs.readFileSync(LOGS_DB, 'utf8');
        const logs = JSON.parse(data);
        console.log(`Loaded ${logs.length} chat logs from database`);
        return logs;
    } catch (error) {
        console.error('Error reading chat logs from database:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
        initializeDatabase();
        
        const logs = getChatLogs();
        
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
        
        fs.writeFileSync(LOGS_DB, JSON.stringify(logs, null, 2));
        console.log('Chat log saved to database, total logs:', logs.length);
        return true;
    } catch (error) {
        console.error('Error saving chat log to database:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        initializeDatabase();
        
        fs.writeFileSync(LOGS_DB, JSON.stringify([], null, 2));
        console.log('All chat logs cleared from database');
        return true;
    } catch (error) {
        console.error('Error clearing logs from database:', error);
        return false;
    }
}

// Prompt management functions
export function getSavedPrompts() {
    try {
        initializeDatabase();
        
        const data = fs.readFileSync(PROMPTS_DB, 'utf8');
        const prompts = JSON.parse(data);
        console.log(`Loaded ${Object.keys(prompts).length} saved prompts from database`);
        return prompts;
    } catch (error) {
        console.error('Error reading saved prompts from database:', error);
        return {};
    }
}

export function savePrompt(promptName, promptData) {
    try {
        initializeDatabase();
        
        const prompts = getSavedPrompts();
        
        const promptWithTimestamp = {
            ...promptData,
            name: promptName,
            createdAt: prompts[promptName] ? prompts[promptName].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        prompts[promptName] = promptWithTimestamp;
        
        fs.writeFileSync(PROMPTS_DB, JSON.stringify(prompts, null, 2));
        console.log(`Prompt "${promptName}" saved to database`);
        return true;
    } catch (error) {
        console.error('Error saving prompt to database:', error);
        return false;
    }
}

export function deletePrompt(promptName) {
    try {
        initializeDatabase();
        
        const prompts = getSavedPrompts();
        
        if (prompts[promptName]) {
            delete prompts[promptName];
            fs.writeFileSync(PROMPTS_DB, JSON.stringify(prompts, null, 2));
            console.log(`Prompt "${promptName}" deleted from database`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error deleting prompt from database:', error);
        return false;
    }
}

// Initialize database on import
initializeDatabase();