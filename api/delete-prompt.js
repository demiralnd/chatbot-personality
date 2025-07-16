export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { promptName } = req.body;

    if (!promptName) {
        return res.status(400).json({ error: 'Prompt name is required' });
    }

    try {
        // Initialize storage if needed
        if (!global.chatbotStorage) {
            global.chatbotStorage = { config: null, logs: [], savedPrompts: {} };
        }
        if (!global.chatbotStorage.savedPrompts) {
            global.chatbotStorage.savedPrompts = {};
        }

        // Check if prompt exists
        if (!global.chatbotStorage.savedPrompts[promptName]) {
            return res.status(404).json({ error: `Prompt "${promptName}" not found` });
        }

        // Delete the prompt
        delete global.chatbotStorage.savedPrompts[promptName];

        console.log(`Prompt "${promptName}" deleted`);

        res.status(200).json({
            success: true,
            message: `Prompt "${promptName}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        res.status(500).json({ error: 'Failed to delete prompt' });
    }
}