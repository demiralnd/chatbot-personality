import fs from 'fs';
import path from 'path';

// Database files - these will be committed to the project and persist across deployments
const DB_DIR = path.join(process.cwd(), 'database');
const CONFIG_DB = path.join(DB_DIR, 'config.json');
const LOGS_DB = path.join(DB_DIR, 'logs.json');

// Backup configuration to JavaScript files that can be committed
const CONFIG_BACKUP = path.join(process.cwd(), 'config-backup.js');

// In-memory storage for Vercel environment
let memoryConfig = null;
let memoryLogs = [];

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


        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

// Load configuration from backup file if it exists
function loadConfigFromBackup() {
    try {
        if (fs.existsSync(CONFIG_BACKUP)) {
            // Delete require cache to get fresh config
            delete require.cache[require.resolve(CONFIG_BACKUP)];
            const configModule = require(CONFIG_BACKUP);
            return configModule.default || configModule;
        }
    } catch (error) {
        console.error('Error loading config from backup:', error);
    }
    return null;
}

// Save configuration to backup file
function saveConfigToBackup(config) {
    try {
        const configContent = `// Auto-generated configuration backup
// This file is automatically updated when admin changes configuration
export default ${JSON.stringify(config, null, 2)};
`;
        fs.writeFileSync(CONFIG_BACKUP, configContent);
        console.log('Configuration backed up to config-backup.js');
        return true;
    } catch (error) {
        console.error('Error saving config backup:', error);
        return false;
    }
}

// Configuration functions
export function getConfig() {
    try {
        initializeDatabase();
        
        // Priority order:
        // 1. Environment variables (highest priority)
        // 2. Memory storage (current session)
        // 3. Backup file (persistent across deployments)
        // 4. Database file (temporary)
        // 5. Default config (fallback)
        
        // Check environment variables first
        if (process.env.SYSTEM_PROMPT_1 && process.env.SYSTEM_PROMPT_2) {
            return {
                systemPrompt1: process.env.SYSTEM_PROMPT_1,
                systemPrompt2: process.env.SYSTEM_PROMPT_2,
                enableLogging: process.env.ENABLE_LOGGING !== 'false',
                logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
            };
        }

        // Check memory storage (current session)
        if (memoryConfig) {
            console.log('Config loaded from memory:', memoryConfig);
            return memoryConfig;
        }

        // Check backup file (persists across deployments)
        const backupConfig = loadConfigFromBackup();
        if (backupConfig) {
            console.log('Config loaded from backup file:', backupConfig);
            memoryConfig = backupConfig; // Cache in memory
            return backupConfig;
        }

        // Read from database file
        if (fs.existsSync(CONFIG_DB)) {
            try {
                const data = fs.readFileSync(CONFIG_DB, 'utf8');
                const config = JSON.parse(data);
                console.log('Config loaded from database:', config);
                memoryConfig = config; // Cache in memory
                return config;
            } catch (error) {
                console.warn('Could not read database file:', error.message);
            }
        }

        // Return defaults
        console.log('Using default configuration');
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error reading config:', error);
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
        
        // Save to multiple locations for maximum persistence
        let success = false;
        
        // 1. Save to memory (always works)
        memoryConfig = configWithTimestamp;
        console.log('Config saved to memory:', configWithTimestamp);
        success = true;
        
        // 2. Save to database file (temporary)
        try {
            fs.writeFileSync(CONFIG_DB, JSON.stringify(configWithTimestamp, null, 2));
            console.log('Config saved to database file');
        } catch (dbError) {
            console.warn('Could not save to database file:', dbError.message);
        }
        
        // 3. Save to backup file (persistent across deployments)
        try {
            const backupSaved = saveConfigToBackup(configWithTimestamp);
            if (backupSaved) {
                console.log('Config backed up for permanent persistence');
            }
        } catch (backupError) {
            console.warn('Could not save backup file:', backupError.message);
        }
        
        // Return true if at least memory save worked
        return success;
    } catch (error) {
        console.error('Error saving config:', error);
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


// Initialize database on import
initializeDatabase();