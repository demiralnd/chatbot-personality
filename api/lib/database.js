import fs from 'fs';
import path from 'path';

// Database files - these will be committed to the project and persist across deployments
const DB_DIR = path.join(process.cwd(), 'database');
const CONFIG_DB = path.join(DB_DIR, 'config.json');
const LOGS_DB = path.join(DB_DIR, 'logs.json');
const PROMPTS_DB = path.join(DB_DIR, 'prompts.json');

// Backup configuration to JavaScript files that can be committed
const CONFIG_BACKUP = path.join(process.cwd(), 'config-backup.js');
const PROMPTS_BACKUP = path.join(process.cwd(), 'prompts-backup.js');

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
        // 2. Backup file (persistent across deployments)
        // 3. Database file (temporary)
        // 4. Default config (fallback)
        
        // Check environment variables first
        if (process.env.SYSTEM_PROMPT_1 && process.env.SYSTEM_PROMPT_2) {
            return {
                systemPrompt1: process.env.SYSTEM_PROMPT_1,
                systemPrompt2: process.env.SYSTEM_PROMPT_2,
                enableLogging: process.env.ENABLE_LOGGING !== 'false',
                logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
            };
        }

        // Check backup file (persists across deployments)
        const backupConfig = loadConfigFromBackup();
        if (backupConfig) {
            console.log('Config loaded from backup file:', backupConfig);
            return backupConfig;
        }

        // Read from database file
        if (fs.existsSync(CONFIG_DB)) {
            const data = fs.readFileSync(CONFIG_DB, 'utf8');
            const config = JSON.parse(data);
            console.log('Config loaded from database:', config);
            return config;
        }

        // Return defaults
        console.log('Using default configuration');
        return DEFAULT_CONFIG;
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
        
        // Save to multiple locations for maximum persistence
        
        // 1. Save to database file (temporary)
        fs.writeFileSync(CONFIG_DB, JSON.stringify(configWithTimestamp, null, 2));
        console.log('Config saved to database:', configWithTimestamp);
        
        // 2. Save to backup file (persistent across deployments)
        const backupSaved = saveConfigToBackup(configWithTimestamp);
        if (backupSaved) {
            console.log('Config backed up for permanent persistence');
        }
        
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

// Load prompts from backup file if it exists
function loadPromptsFromBackup() {
    try {
        if (fs.existsSync(PROMPTS_BACKUP)) {
            // Delete require cache to get fresh prompts
            delete require.cache[require.resolve(PROMPTS_BACKUP)];
            const promptsModule = require(PROMPTS_BACKUP);
            return promptsModule.default || promptsModule;
        }
    } catch (error) {
        console.error('Error loading prompts from backup:', error);
    }
    return {};
}

// Save prompts to backup file
function savePromptsToBackup(prompts) {
    try {
        const promptsContent = `// Auto-generated prompts backup
// This file is automatically updated when admin saves prompts
export default ${JSON.stringify(prompts, null, 2)};
`;
        fs.writeFileSync(PROMPTS_BACKUP, promptsContent);
        console.log('Prompts backed up to prompts-backup.js');
        return true;
    } catch (error) {
        console.error('Error saving prompts backup:', error);
        return false;
    }
}

// Prompt management functions
export function getSavedPrompts() {
    try {
        initializeDatabase();
        
        // Priority order:
        // 1. Backup file (persistent across deployments)
        // 2. Database file (temporary)
        // 3. Empty object (fallback)
        
        // Check backup file first
        const backupPrompts = loadPromptsFromBackup();
        if (backupPrompts && Object.keys(backupPrompts).length > 0) {
            console.log(`Loaded ${Object.keys(backupPrompts).length} saved prompts from backup`);
            return backupPrompts;
        }
        
        // Check database file
        if (fs.existsSync(PROMPTS_DB)) {
            const data = fs.readFileSync(PROMPTS_DB, 'utf8');
            const prompts = JSON.parse(data);
            console.log(`Loaded ${Object.keys(prompts).length} saved prompts from database`);
            return prompts;
        }
        
        return {};
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
        
        // Save to multiple locations for maximum persistence
        
        // 1. Save to database file (temporary)
        fs.writeFileSync(PROMPTS_DB, JSON.stringify(prompts, null, 2));
        console.log(`Prompt "${promptName}" saved to database`);
        
        // 2. Save to backup file (persistent across deployments)
        const backupSaved = savePromptsToBackup(prompts);
        if (backupSaved) {
            console.log(`Prompt "${promptName}" backed up for permanent persistence`);
        }
        
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
            
            // Delete from multiple locations for consistency
            
            // 1. Delete from database file (temporary)
            fs.writeFileSync(PROMPTS_DB, JSON.stringify(prompts, null, 2));
            console.log(`Prompt "${promptName}" deleted from database`);
            
            // 2. Update backup file (persistent across deployments)
            const backupSaved = savePromptsToBackup(prompts);
            if (backupSaved) {
                console.log(`Prompt "${promptName}" deletion backed up for permanent persistence`);
            }
            
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