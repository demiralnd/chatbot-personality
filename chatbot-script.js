class GroqChatbot {
    constructor(chatbotId) {
        this.chatbotId = chatbotId;
        this.systemPrompt = '';
        this.currentSession = [];
        this.messageTimestamps = []; // Track timestamps separately
        this.enableLogging = true;
        this.isConfigured = false;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = new Date().toISOString();
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupBeforeUnloadHandler();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => this.sendMessage());
    }

    setupBeforeUnloadHandler() {
        // Save session when user closes tab or navigates away
        window.addEventListener('beforeunload', () => {
            if (this.currentSession.length > 0) {
                // Use navigator.sendBeacon for reliable data sending on page unload
                // Add timestamps back to messages for logging
                const messagesWithTimestamps = this.currentSession.map((msg, index) => ({
                    ...msg,
                    timestamp: this.messageTimestamps[index] || this.sessionStartTime
                }));

                const sessionData = {
                    id: this.sessionId,
                    chatbotId: this.chatbotId,
                    chatbotName: `Chatbot ${this.chatbotId}`,
                    title: this.getSessionTitle(),
                    timestamp: this.sessionStartTime,
                    messages: messagesWithTimestamps
                };

                const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
                navigator.sendBeacon('/api/logs?action=save', blob);
            }
        });
    }


    async loadSettings() {
        // Check if server is configured
        try {
            const response = await fetch('/api/config?action=api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.apiKey) {
                    this.isConfigured = true;
                }
            }
        } catch (error) {
            console.log('Could not verify server configuration');
        }

        // Load configuration from server
        try {
            const response = await fetch('/api/config?action=config');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    const config = data.config;
                    this.systemPrompt = this.chatbotId === 1 ? config.systemPrompt1 : config.systemPrompt2;
                    this.enableLogging = config.enableLogging !== false;
                } else {
                    this.systemPrompt = this.getDefaultSystemPrompt();
                    this.enableLogging = true;
                }
            } else {
                this.systemPrompt = this.getDefaultSystemPrompt();
                this.enableLogging = true;
            }
        } catch (error) {
            console.log('Could not fetch config from server, using defaults');
            this.systemPrompt = this.getDefaultSystemPrompt();
            this.enableLogging = true;
        }

        // Update UI after settings are loaded
        this.updateUI();
    }

    getDefaultSystemPrompt() {
        const defaultPrompts = {
            1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
            2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.'
        };
        return defaultPrompts[this.chatbotId] || defaultPrompts[1];
    }

    updateUI() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const welcomeMessage = document.querySelector('.welcome-message');

        if (this.isConfigured) {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.placeholder = 'Mesajınızı yazın...';
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }
        } else {
            messageInput.disabled = true;
            sendButton.disabled = true;
            messageInput.placeholder = 'Chatbot yapılandırılıyor...';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || !this.isConfigured) return;

        messageInput.value = '';
        this.addMessage('user', message);
        this.showTypingIndicator();

        try {
            const response = await this.callChatAPI(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', `Hata: ${error.message}`);
            console.error('Chat API Hatası:', error);
        }
    }

    async callChatAPI(userMessage) {
        // Only send conversation history without system prompt (handled server-side)
        const messages = [
            ...this.currentSession,
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                chatbotId: this.chatbotId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message;
    }

    addMessage(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to current session
        this.currentSession.push({ role, content });
        this.messageTimestamps.push(new Date().toISOString());
        
        // Save session after each message exchange if logging is enabled
        if (this.enableLogging && role === 'assistant') {
            this.saveSession();
        }
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content loading">
                <span>Yapay zeka yazıyor</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }

    async saveSession() {
        if (!this.enableLogging || this.currentSession.length === 0) return;

        try {
            // Add timestamps back to messages for logging
            const messagesWithTimestamps = this.currentSession.map((msg, index) => ({
                ...msg,
                timestamp: this.messageTimestamps[index] || this.sessionStartTime
            }));

            const sessionData = {
                id: this.sessionId,
                chatbotId: this.chatbotId,
                chatbotName: `Chatbot ${this.chatbotId}`,
                title: this.getSessionTitle(),
                timestamp: this.sessionStartTime,
                messages: messagesWithTimestamps
            };

            const response = await fetch('/api/logs?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                console.error('Failed to save session:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    getSessionTitle() {
        const firstUserMessage = this.currentSession.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
        }
        return 'Untitled Session';
    }

    newChat() {
        // Save current session before clearing if it has content
        if (this.currentSession.length > 0) {
            this.saveSession();
        }
        
        // Clear current session and generate new session ID
        this.currentSession = [];
        this.messageTimestamps = [];
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = new Date().toISOString();
        
        // Clear chat messages from UI
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Show welcome message if exists
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
        }
    }



    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007aff;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);