class GroqChatbot {
    constructor() {
        this.apiKey = '';
        this.systemPrompt = 'Sen yardımcı bir yapay zeka asistanısın. Kısa ve yararlı yanıtlar ver. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.';
        this.currentSession = [];
        this.chatLogs = this.loadChatLogs();
        this.enableLogging = true;
        this.sessionSaved = false;
        this.init();
    }

    async init() {
        await this.loadSettings();
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
        // Try to load global API key first, fallback to local storage
        try {
            const response = await fetch('/api/get-api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.apiKey) {
                    this.apiKey = data.apiKey;
                }
            }
        } catch (error) {
            console.log('Using local API key storage as fallback');
        }

        // Fallback to local storage if global API key is not available
        if (!this.apiKey) {
            const savedApiKey = localStorage.getItem('groq_api_key');
            if (savedApiKey) {
                this.apiKey = savedApiKey;
            }
        }

        const savedSystemPrompt = localStorage.getItem('system_prompt');
        const enableLogging = localStorage.getItem('enable_logging');

        if (savedSystemPrompt) {
            this.systemPrompt = savedSystemPrompt;
        }

        if (enableLogging !== null) {
            this.enableLogging = enableLogging === 'true';
        }

        // Update UI after settings are loaded
        this.updateUI();
    }


    updateUI() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const welcomeMessage = document.querySelector('.welcome-message');

        if (this.apiKey) {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.placeholder = 'Type your message...';
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }
        } else {
            messageInput.disabled = true;
            sendButton.disabled = true;
            messageInput.placeholder = 'Chatbot is being configured...';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || !this.apiKey) return;

        messageInput.value = '';
        this.addMessage('user', message);
        this.showTypingIndicator();

        try {
            const response = await this.callGroqAPI(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
            
            // Session will be saved when user ends the conversation
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', `Error: ${error.message}`);
            console.error('Groq API Error:', error);
        }
    }

    async callGroqAPI(userMessage) {
        const messages = [
            { role: 'system', content: this.systemPrompt },
            ...this.currentSession,
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
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
                <span>AI is typing</span>
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
            title: this.generateSessionTitle(),
            timestamp: new Date().toISOString(),
            messages: [...this.currentSession]
        };

        this.chatLogs.unshift(sessionData);
        this.saveChatLogs();
        
        // Mark session as saved
        this.sessionSaved = true;
    }

    generateSessionTitle() {
        const firstUserMessage = this.currentSession.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
        }
        return 'New Chat';
    }

    loadChatLogs() {
        const saved = localStorage.getItem('chat_logs');
        return saved ? JSON.parse(saved) : [];
    }

    saveChatLogs() {
        localStorage.setItem('chat_logs', JSON.stringify(this.chatLogs));
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

// Global functions for HTML onclick handlers
function sendMessage() {
    chatbot.sendMessage();
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

// Initialize the chatbot
const chatbot = new GroqChatbot();