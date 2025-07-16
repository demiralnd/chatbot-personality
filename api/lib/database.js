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

// Save configuration to backup file
function saveConfigToBackup(config) {
    try {
        console.log('🔄 Attempting to save config to backup file:', CONFIG_BACKUP);
        console.log('🔄 Config to save:', JSON.stringify(config, null, 2));
        
        const configContent = `// Auto-generated configuration backup
// This file is automatically updated when admin changes configuration
export default ${JSON.stringify(config, null, 2)};
`;
        
        fs.writeFileSync(CONFIG_BACKUP, configContent);
        console.log('✅ Configuration successfully backed up to config-backup.mjs');
        
        // Verify the file was written
        if (fs.existsSync(CONFIG_BACKUP)) {
            const fileSize = fs.statSync(CONFIG_BACKUP).size;
            console.log(`✅ Backup file exists with size: ${fileSize} bytes`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error saving config backup:', error);
        console.error('❌ Backup file path:', CONFIG_BACKUP);
        console.error('❌ Current working directory:', process.cwd());
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
            console.log('Using environment variable configuration');
            return {
                systemPrompt1: process.env.SYSTEM_PROMPT_1,
                systemPrompt2: process.env.SYSTEM_PROMPT_2,
                enableLogging: process.env.ENABLE_LOGGING !== 'false',
                logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
            };
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
                console.log('Config loaded from database file:', config);
                memoryConfig = config; // Cache in memory
                return config;
            }
        } catch (error) {
            console.warn('Could not read database file:', error.message);
        }

        // Check memory storage (current session cache)
        if (memoryConfig) {
            console.log('Config loaded from memory cache:', memoryConfig);
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
        
        // PRIORITY: Save to backup file first (this is what truly persists)
        let backupSuccess = false;
        try {
            backupSuccess = saveConfigToBackup(configWithTimestamp);
            if (backupSuccess) {
                console.log('✅ Config saved to backup file (permanent persistence)');
            }
        } catch (backupError) {
            console.error('❌ CRITICAL: Could not save backup file:', backupError.message);
        }
        
        // Save to memory for current session
        memoryConfig = configWithTimestamp;
        console.log('Config cached in memory for current session');
        
        // Try to save to database file as additional backup
        try {
            initializeDatabase();
            fs.writeFileSync(CONFIG_DB, JSON.stringify(configWithTimestamp, null, 2));
            console.log('Config also saved to database file');
        } catch (dbError) {
            console.warn('Could not save to database file:', dbError.message);
        }
        
        // Return true ONLY if backup file save worked (the only true persistence)
        return backupSuccess;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Chat logs functions
export function getChatLogs() {
    try {
        // Priority: Database file, then memory, then empty array
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
        
        // Try to save to database file
        try {
            initializeDatabase();
            fs.writeFileSync(LOGS_DB, JSON.stringify(logs, null, 2));
            console.log('Chat log also saved to database file');
        } catch (dbError) {
            console.warn('Could not save log to database file:', dbError.message);
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
        
        // Try to clear database file
        try {
            initializeDatabase();
            fs.writeFileSync(LOGS_DB, JSON.stringify([], null, 2));
            console.log('All chat logs also cleared from database file');
        } catch (dbError) {
            console.warn('Could not clear database file:', dbError.message);
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}


// Initialize database on import
initializeDatabase();