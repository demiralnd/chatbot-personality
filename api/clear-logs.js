import { clearAllLogs } from './lib/database.js';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const cleared = clearAllLogs();
        
        if (cleared) {
            res.status(200).json({
                success: true,
                message: 'All chat logs cleared successfully'
            });
        } else {
            throw new Error('Failed to clear logs');
        }
    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).json({ error: 'Failed to clear chat logs' });
    }
}