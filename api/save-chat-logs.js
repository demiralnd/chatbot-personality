export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chatLog } = req.body;

    if (!chatLog) {
        return res.status(400).json({ error: 'Chat log data is required' });
    }

    try {
        // In production, save to database
        // For now, store in memory (will reset on restart)
        if (!global.chatLogs) {
            global.chatLogs = [];
        }
        
        global.chatLogs.push(chatLog);
        
        res.status(200).json({
            success: true,
            message: 'Chat log saved successfully'
        });
    } catch (error) {
        console.error('Error saving chat log:', error);
        res.status(500).json({ error: 'Failed to save chat log' });
    }
}