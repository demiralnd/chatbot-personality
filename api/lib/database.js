import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
} else {
    console.warn('⚠️ Supabase credentials not found in environment variables');
}

// In-memory storage for session-based caching
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

// Initialize in-memory storage
function initializeStorage() {
    console.log('Initializing in-memory storage for session');
    if (!memoryConfig) {
        memoryConfig = null;
    }
    if (!memoryLogs) {
        memoryLogs = [];
    }
    return true;
}

// Load configuration from Supabase
async function loadConfigFromDatabase() {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('chatbot_config')
            .select('*')
            .order('last_updated', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('❌ Error loading config from Supabase:', error);
            return null;
        }

        if (data) {
            console.log('✅ Config loaded from Supabase');
            return {
                systemPrompt1: data.system_prompt_1,
                systemPrompt2: data.system_prompt_2,
                enableLogging: data.enable_logging,
                logTimestamps: data.log_timestamps,
                lastUpdated: data.last_updated
            };
        }

        return null;
    } catch (error) {
        console.error('❌ Error loading config from database:', error);
        return null;
    }
}

// Save configuration to Supabase
async function saveConfigToDatabase(config) {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized');
        return false;
    }

    try {
        // First, try to update existing config
        const { data: existing } = await supabase
            .from('chatbot_config')
            .select('id')
            .limit(1)
            .single();

        let result;
        if (existing) {
            // Update existing record
            result = await supabase
                .from('chatbot_config')
                .update({
                    system_prompt_1: config.systemPrompt1,
                    system_prompt_2: config.systemPrompt2,
                    enable_logging: config.enableLogging,
                    log_timestamps: config.logTimestamps,
                    last_updated: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            // Insert new record
            result = await supabase
                .from('chatbot_config')
                .insert({
                    system_prompt_1: config.systemPrompt1,
                    system_prompt_2: config.systemPrompt2,
                    enable_logging: config.enableLogging,
                    log_timestamps: config.logTimestamps
                });
        }

        if (result.error) {
            console.error('❌ Error saving config to Supabase:', result.error);
            return false;
        }

        console.log('✅ Config saved to Supabase successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving config to database:', error);
        return false;
    }
}

// Configuration functions
export async function getConfig() {
    try {
        console.log('🔍 DEBUG: Getting configuration...');
        console.log('🔍 DEBUG: Environment variables check:');
        console.log('  - SYSTEM_PROMPT_1:', process.env.SYSTEM_PROMPT_1 ? 'SET' : 'NOT SET');
        console.log('  - SYSTEM_PROMPT_2:', process.env.SYSTEM_PROMPT_2 ? 'SET' : 'NOT SET');
        console.log('  - ENABLE_LOGGING:', process.env.ENABLE_LOGGING);
        console.log('  - LOG_TIMESTAMPS:', process.env.LOG_TIMESTAMPS);
        
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

        // Check Supabase database (will be implemented)
        const dbConfig = await loadConfigFromDatabase();
        if (dbConfig) {
            console.log('✅ Config loaded from Supabase database:', dbConfig);
            memoryConfig = dbConfig; // Cache in memory for performance
            return dbConfig;
        }

        // Check memory storage (current session cache)
        if (memoryConfig) {
            console.log('✅ Config loaded from memory cache:', memoryConfig);
            return memoryConfig;
        }

        // Return defaults
        console.log('⚠️ Using default configuration (no saved config found)');
        console.log('Default config:', DEFAULT_CONFIG);
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
        
        // Save to Supabase database (will be implemented)
        const dbSuccess = await saveConfigToDatabase(configWithTimestamp);
        if (dbSuccess) {
            console.log('✅ Config saved to Supabase database');
        }
        
        // Save to memory for current session
        memoryConfig = configWithTimestamp;
        console.log('Config cached in memory for current session');
        
        // If no database, at least we have memory storage
        return dbSuccess || true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Chat logs functions
export async function getChatLogs() {
    try {
        // Load from Supabase database (will be implemented)
        const dbLogs = await loadLogsFromDatabase();
        if (dbLogs) {
            console.log(`✅ Loaded ${dbLogs.length} chat logs from Supabase database`);
            memoryLogs = dbLogs; // Cache in memory
            return dbLogs;
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

// Load chat logs from Supabase
async function loadLogsFromDatabase() {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('chat_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1000);

        if (error) {
            console.error('❌ Error loading logs from Supabase:', error);
            return null;
        }

        if (data) {
            console.log(`✅ Loaded ${data.length} chat logs from Supabase`);
            return data.map(log => ({
                id: log.id,
                chatbotId: log.chatbot_id,
                chatbotName: log.chatbot_name,
                title: log.title,
                messages: log.messages,
                userAgent: log.user_agent,
                ipAddress: log.ip_address,
                sessionId: log.session_id,
                timestamp: log.timestamp
            }));
        }

        return [];
    } catch (error) {
        console.error('❌ Error loading logs from database:', error);
        return null;
    }
}

// Save a single chat log to Supabase
async function saveLogToDatabase(log) {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized');
        return false;
    }

    try {
        const { error } = await supabase
            .from('chat_logs')
            .insert({
                chatbot_id: log.chatbotId,
                chatbot_name: log.chatbotName,
                title: log.title,
                messages: log.messages,
                user_agent: log.userAgent,
                ip_address: log.ipAddress,
                session_id: log.sessionId,
                timestamp: log.timestamp
            });

        if (error) {
            console.error('❌ Error saving log to Supabase:', error);
            return false;
        }

        console.log('✅ Chat log saved to Supabase successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving log to database:', error);
        return false;
    }
}

export async function saveChatLog(logEntry) {
    try {
        console.log('🔍 DEBUG: Saving chat log entry:', logEntry);
        const logs = await getChatLogs();
        console.log('🔍 DEBUG: Current logs count:', logs.length);
        
        const enrichedLog = {
            ...logEntry,
            id: logEntry.id || Date.now().toString(),
            timestamp: logEntry.timestamp || new Date().toISOString(),
            userAgent: logEntry.userAgent || 'Unknown',
            ipAddress: logEntry.ipAddress || 'Unknown'
        };
        
        console.log('🔍 DEBUG: Enriched log:', enrichedLog);
        
        // Add to beginning
        logs.unshift(enrichedLog);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(1000);
        }
        
        // Save to memory first (guaranteed to work)
        memoryLogs = logs;
        console.log('✅ Chat log saved to memory, total logs:', logs.length);
        
        // Save to Supabase database
        const dbSuccess = await saveLogToDatabase(enrichedLog);
        if (dbSuccess) {
            console.log('✅ Chat log saved to Supabase database');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving chat log:', error);
        return false;
    }
}

export async function clearAllLogs() {
    try {
        // Clear memory first
        memoryLogs = [];
        console.log('✅ All chat logs cleared from memory');
        
        // Clear Supabase database (will be implemented)
        const dbSuccess = await clearLogsFromDatabase();
        if (dbSuccess) {
            console.log('✅ All chat logs cleared from Supabase database');
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
}

// Clear all logs from Supabase
async function clearLogsFromDatabase() {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized');
        return false;
    }

    try {
        const { error } = await supabase
            .from('chat_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (Supabase requires a condition)

        if (error) {
            console.error('❌ Error clearing logs from Supabase:', error);
            return false;
        }

        console.log('✅ All chat logs cleared from Supabase successfully');
        return true;
    } catch (error) {
        console.error('❌ Error clearing logs from database:', error);
        return false;
    }
}

// Initialize storage on import
initializeStorage();