class GroqChatbot {
    constructor(chatbotId) {
        this.chatbotId = chatbotId;
        this.systemPrompt = '';
        this.currentSession = [];
        this.chatLogs = [];
        this.enableLogging = true;
        this.sessionSaved = false;
        this.isConfigured = false;
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.chatLogs = await this.loadChatLogs();
        this.setupEventListeners();
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
        
        // Save session when page is about to unload
        window.addEventListener('beforeunload', () => {
            if (this.currentSession.length > 0 && !this.sessionSaved) {
                this.saveChatSession();
            }
        });
        
        // Save session when user navigates away
        window.addEventListener('pagehide', () => {
            if (this.currentSession.length > 0 && !this.sessionSaved) {
                this.saveChatSession();
            }
        });
    }

    async loadSettings() {
        // Check if server is configured
        try {
            const response = await fetch('/api/get-api-key');
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
            const response = await fetch('/api/get-config');
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
            
            // Session will be saved when user ends the conversation
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

    saveChatSession() {
        if (this.currentSession.length === 0 || !this.enableLogging || this.sessionSaved) return;

        const sessionData = {
            id: Date.now().toString(),
            chatbotId: this.chatbotId,
            chatbotName: `Chatbot ${this.chatbotId}`,
            title: this.generateSessionTitle(),
            timestamp: new Date().toISOString(),
            messages: [...this.currentSession]
        };

        this.chatLogs.unshift(sessionData);
        this.saveChatLogs();
        
        // Send complete session to server
        this.logSessionToServer(sessionData);
        
        // Mark session as saved
        this.sessionSaved = true;
    }
    
    newChat() {
        // Save current session if it has messages
        if (this.currentSession.length > 0) {
            this.saveChatSession();
        }
        
        // Clear current session and reset save flag
        this.currentSession = [];
        this.sessionSaved = false;
        
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

    generateSessionTitle() {
        const firstUserMessage = this.currentSession.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
        }
        return 'Yeni Sohbet';
    }

    async loadChatLogs() {
        try {
            const response = await fetch('/api/get-chat-logs');
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.chatLogs : [];
            }
        } catch (error) {
            console.error('Error loading chat logs from server:', error);
        }
        return [];
    }

    async saveChatLogs() {
        try {
            await fetch('/api/save-chat-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chatLogs: this.chatLogs })
            });
        } catch (error) {
            console.error('Error saving chat logs to server:', error);
        }
    }

    async logSessionToServer(sessionData) {
        try {
            await fetch('/api/log-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });
        } catch (error) {
            console.warn('Failed to log session to server:', error);
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