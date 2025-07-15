export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Use runtime config if available, otherwise use environment variables or defaults
    const defaultConfig = {
        systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
        systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
        enableLogging: true,
        logTimestamps: true
    };

    const config = global.adminConfig ? {
        systemPrompt1: global.adminConfig.systemPrompt1 || defaultConfig.systemPrompt1,
        systemPrompt2: global.adminConfig.systemPrompt2 || defaultConfig.systemPrompt2,
        enableLogging: global.adminConfig.enableLogging !== false,
        logTimestamps: global.adminConfig.logTimestamps !== false
    } : {
        systemPrompt1: process.env.SYSTEM_PROMPT_1 || defaultConfig.systemPrompt1,
        systemPrompt2: process.env.SYSTEM_PROMPT_2 || defaultConfig.systemPrompt2,
        enableLogging: process.env.ENABLE_LOGGING !== 'false',
        logTimestamps: process.env.LOG_TIMESTAMPS !== 'false'
    };

    res.status(200).json({
        success: true,
        config
    });
}