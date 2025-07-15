export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { systemPrompt1, systemPrompt2, enableLogging, logTimestamps } = req.body;

    if (!systemPrompt1 || !systemPrompt2) {
        return res.status(400).json({ error: 'System prompts are required' });
    }

    try {
        // In production, store in database or secure file storage
        // For now, we'll use environment variables (requires server restart)
        // A better approach would be to use a database or JSON file
        
        // For immediate use without restart, store in memory (will reset on restart)
        global.adminConfig = {
            systemPrompt1,
            systemPrompt2,
            enableLogging: enableLogging === true,
            logTimestamps: logTimestamps === true
        };

        res.status(200).json({
            success: true,
            message: 'Configuration saved successfully'
        });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
}