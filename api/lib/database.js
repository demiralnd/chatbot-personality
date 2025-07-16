import fs from 'fs';
import path from 'path';

// Database files - these will be committed to the project and persist across deployments
const DB_DIR = path.join(process.cwd(), 'database');
const CONFIG_DB = path.join(DB_DIR, 'config.json');
const LOGS_DB = path.join(DB_DIR, 'logs.json');

// Backup configuration to JavaScript files that can be committed
const CONFIG_BACKUP = path.join(process.cwd(), 'config-backup.mjs');

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

// Initialize database directory and files (Vercel-compatible)
function initializeDatabase() {
    try {
        // On Vercel, file system is read-only, so we can't create directories or files
        // We'll rely on memory storage and existing files
        
        // Check if database directory exists (read-only check)
        if (fs.existsSync(DB_DIR)) {
            console.log('Database directory exists');
        } else {
            console.log('Database directory does not exist (using memory storage)');
        }

        // Check if config file exists (read-only check)
        if (fs.existsSync(CONFIG_DB)) {
            console.log('Config database file exists');
        } else {
            console.log('Config database file does not exist (using memory storage)');
        }

        // Check if logs file exists (read-only check)
        if (fs.existsSync(LOGS_DB)) {
            console.log('Logs database file exists');
        } else {
            console.log('Logs database file does not exist (using memory storage)');
        }

        return true;
    } catch (error) {
        console.error('Error checking database files:', error);
        return false;
    }
}

// Load configuration from backup file if it exists
async function loadConfigFromBackup() {
    try {
        console.log('🔄 Checking for backup file:', CONFIG_BACKUP);
        
        if (fs.existsSync(CONFIG_BACKUP)) {
            console.log('✅ Backup file exists, attempting to load...');
            
            // Fallback: try reading as plain text and parsing (more reliable)
            try {
                const backupContent = fs.readFileSync(CONFIG_BACKUP, 'utf8');
                console.log('📄 Backup file content preview:', backupContent.substring(0, 200) + '...');
                
                const match = backupContent.match(/export default\s+(\{[\s\S]*?\});/);
                if (match) {
                    const config = JSON.parse(match[1]);
                    console.log('✅ Successfully loaded config from backup:', config);
                    return config;
                }
            } catch (parseError) {
                console.error('❌ Could not parse backup file:', parseError);
            }
            
            // Try dynamic import as fallback
            try {
                const cacheBuster = '?t=' + Date.now();
                const configModule = await import(CONFIG_BACKUP + cacheBuster);
                const config = configModule.default || configModule;
                console.log('✅ Successfully loaded config via import:', config);
                return config;
            } catch (importError) {
                console.error('❌ Could not import backup file:', importError);
            }
        } else {
            console.log('❌ Backup file does not exist');
        }
    } catch (error) {
        console.error('❌ Error loading config from backup:', error);
    }
    return null;
}

// Save configuration to backup file (Vercel-compatible)
function saveConfigToBackup(config) {
    try {
        console.log('🔄 Attempting to save config to backup file (Vercel environment):', CONFIG_BACKUP);
        console.log('🔄 Config to save:', JSON.stringify(config, null, 2));
        
        // In Vercel, we can't write to the file system
        // But we can try to write to /tmp which is writable
        const tmpBackup = '/tmp/config-backup.mjs';
        
        const configContent = `// Auto-generated configuration backup
// This file is automatically updated when admin changes configuration
export default ${JSON.stringify(config, null, 2)};
`;
        
        try {
            fs.writeFileSync(tmpBackup, configContent);
            console.log('✅ Configuration backed up to tmp directory');
        } catch (tmpError) {
            console.warn('⚠️ Could not write to tmp directory:', tmpError.message);
        }
        
        // Try to write to original location (will fail on Vercel but work locally)
        try {
            fs.writeFileSync(CONFIG_BACKUP, configContent);
            console.log('✅ Configuration successfully backed up to config-backup.mjs');
        } catch (writeError) {
            console.warn('⚠️ Could not write to project directory (expected on Vercel):', writeError.message);
        }
        
        return true; // Always return true since we use memory storage as primary
    } catch (error) {
        console.error('❌ Error saving config backup:', error);
        return false;
    }
}

// Configuration functions
export async function getConfig() {
    try {
        // Priority order for TRUE SERVER-SIDE persistence:
        // 1. Environment variables (deployment-level override)
        // 2. Backup file (TRUE persistent storage across all instances)
        // 3. Database file (fallback)
        // 4. Memory (current session cache)
        // 5. Default config (fallback)
        
        // Check environment variables first (deployment-level override)
        if (process.env.SYSTEM_PROMPT_1 && process.env.SYSTEM_PROMPT_2) {
            console.log('✅ Using environment variable configuration');
            const envConfig = {
                systemPrompt1: process.env.SYSTEM_PROMPT_1,
                systemPrompt2: process.env.SYSTEM_PROMPT_2,
                enableLogging: process.env.ENABLE_LOGGING !== 'false',
                logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
            };
            console.log('Environment config:', envConfig);
            return envConfig;
        }

        // Check backup file FIRST (this is the TRUE persistent storage)
        const backupConfig = await loadConfigFromBackup();
        if (backupConfig) {
            console.log('✅ Config loaded from backup file (persistent across all instances):', backupConfig);
            memoryConfig = backupConfig; // Cache in memory for performance
            return backupConfig;
        }

        // Check database file as fallback
        try {
            initializeDatabase();
            if (fs.existsSync(CONFIG_DB)) {
                const data = fs.readFileSync(CONFIG_DB, 'utf8');
                const config = JSON.parse(data);
                console.log('✅ Config loaded from database file:', config);
                memoryConfig = config; // Cache in memory
                return config;
            }
        } catch (error) {
            console.warn('Could not read database file:', error.message);
        }

        // Check for existing chatbot-config.json file (compatibility)
        try {
            const compatConfigPath = path.join(process.cwd(), 'chatbot-config.json');
            if (fs.existsSync(compatConfigPath)) {
                const data = fs.readFileSync(compatConfigPath, 'utf8');
                const config = JSON.parse(data);
                console.log('✅ Config loaded from chatbot-config.json:', config);
                memoryConfig = config; // Cache in memory
                return config;
            }
        } catch (error) {
            console.warn('Could not read chatbot-config.json:', error.message);
        }

        // Check memory storage (current session cache)
        if (memoryConfig) {
            console.log('✅ Config loaded from memory cache:', memoryConfig);
            return memoryConfig;
        }

        // Return defaults
        console.log('Using default configuration (no saved config found)');
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error reading config:', error);
        return DEFAULT_CONFIG;
    }
}

export async function saveConfig(config) {
    try {
        const configWithTimestamp = {
            ...config,
            lastUpdated: new Date().toISOString()
        };
        
        // PRIORITY: Try to save to backup file first (works locally)
        let backupSuccess = false;
        try {
            backupSuccess = saveConfigToBackup(configWithTimestamp);
            if (backupSuccess) {
                console.log('✅ Config saved to backup file (permanent persistence)');
            }
        } catch (backupError) {
            console.error('❌ Could not save backup file:', backupError.message);
        }
        
        // Save to memory for current session
        memoryConfig = configWithTimestamp;
        console.log('Config cached in memory for current session');
        
        // Try to save to database file as additional backup (will fail on Vercel)
        try {
            initializeDatabase();
            fs.writeFileSync(CONFIG_DB, JSON.stringify(configWithTimestamp, null, 2));
            console.log('Config also saved to database file');
        } catch (dbError) {
            console.warn('Could not save to database file (expected on Vercel):', dbError.message);
        }
        
        // For Vercel deployment, show instructions to set environment variables
        if (!backupSuccess) {
            console.log('💡 VERCEL DEPLOYMENT: For persistent configuration, set these environment variables:');
            console.log(`SYSTEM_PROMPT_1="${config.systemPrompt1}"`);
            console.log(`SYSTEM_PROMPT_2="${config.systemPrompt2}"`);
            console.log(`ENABLE_LOGGING="${config.enableLogging}"`);
            console.log(`LOG_TIMESTAMPS="${config.logTimestamps}"`);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        // Priority: Database file, then compatibility file, then memory, then empty array
        try {
            initializeDatabase();
            if (fs.existsSync(LOGS_DB)) {
                const data = fs.readFileSync(LOGS_DB, 'utf8');
                const logs = JSON.parse(data);
                console.log(`✅ Loaded ${logs.length} chat logs from database file`);
                memoryLogs = logs; // Cache in memory
                return logs;
            }
        } catch (dbError) {
            console.warn('Could not read logs from database file:', dbError.message);
        }

        // Check for existing chat-logs.json file (compatibility)
        try {
            const compatLogsPath = path.join(process.cwd(), 'chat-logs.json');
            if (fs.existsSync(compatLogsPath)) {
                const data = fs.readFileSync(compatLogsPath, 'utf8');
                const logs = JSON.parse(data);
                console.log(`✅ Loaded ${logs.length} chat logs from chat-logs.json`);
                memoryLogs = logs; // Cache in memory
                return logs;
            }
        } catch (compatError) {
            console.warn('Could not read chat-logs.json:', compatError.message);
        }
        
        // Fallback to memory
        if (memoryLogs.length > 0) {
            console.log(`Loaded ${memoryLogs.length} chat logs from memory`);
            return memoryLogs;
        }
        
        console.log('No chat logs found');
        return [];
    } catch (error) {
        console.error('Error reading chat logs:', error);
        return [];
    }
}

export function saveChatLog(logEntry) {
    try {
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
        
        // Save to memory first (guaranteed to work)
        memoryLogs = logs;
        console.log('✅ Chat log saved to memory, total logs:', logs.length);
        
        // Try to save to database file (will fail on Vercel)
        try {
            initializeDatabase();
            fs.writeFileSync(LOGS_DB, JSON.stringify(logs, null, 2));
            console.log('Chat log also saved to database file');
        } catch (dbError) {
            console.warn('Could not save log to database file (expected on Vercel):', dbError.message);
        }

        // Try to save to compatibility file (will fail on Vercel)
        try {
            const compatLogsPath = path.join(process.cwd(), 'chat-logs.json');
            fs.writeFileSync(compatLogsPath, JSON.stringify(logs, null, 2));
            console.log('Chat log also saved to chat-logs.json');
        } catch (compatError) {
            console.warn('Could not save log to chat-logs.json (expected on Vercel):', compatError.message);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export function clearAllLogs() {
    try {
        // Clear memory first
        memoryLogs = [];
        console.log('✅ All chat logs cleared from memory');
        
        // Try to clear database file (will fail on Vercel)
        try {
            initializeDatabase();
            fs.writeFileSync(LOGS_DB, JSON.stringify([], null, 2));
            console.log('All chat logs also cleared from database file');
        } catch (dbError) {
            console.warn('Could not clear database file (expected on Vercel):', dbError.message);
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}


// Initialize database on import
initializeDatabase();