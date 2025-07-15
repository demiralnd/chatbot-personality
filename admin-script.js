class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentSection = 'settings';
        this.chatLogs = [];
        this.init();
    }

    init() {
        this.checkLogin();
        this.loadChatLogs();
        this.loadAdminSettings();
        this.updateStats();
    }

    checkLogin() {
        const savedLogin = sessionStorage.getItem('admin_logged_in');
        if (savedLogin === 'true') {
            this.isLoggedIn = true;
            this.showAdminPanel();
        }
    }

    showAdminPanel() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        this.renderChatLogs();
    }

    showLoginPanel() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminContainer').style.display = 'none';
    }

    loadAdminSettings() {
        const apiKey = localStorage.getItem('groq_api_key');
        const systemPrompt1 = localStorage.getItem('system_prompt_chatbot1');
        const systemPrompt2 = localStorage.getItem('system_prompt_chatbot2');
        const enableLogging = localStorage.getItem('enable_logging') !== 'false';
        const logTimestamps = localStorage.getItem('log_timestamps') !== 'false';

        if (apiKey) {
            document.getElementById('adminApiKey').value = apiKey;
        }

        if (systemPrompt1) {
            document.getElementById('adminSystemPrompt1').value = systemPrompt1;
        }

        if (systemPrompt2) {
            document.getElementById('adminSystemPrompt2').value = systemPrompt2;
        }

        document.getElementById('enableLogging').checked = enableLogging;
        document.getElementById('logTimestamps').checked = logTimestamps;
    }

    saveAdminSettings() {
        const apiKey = document.getElementById('adminApiKey').value.trim();
        const systemPrompt1 = document.getElementById('adminSystemPrompt1').value.trim();
        const systemPrompt2 = document.getElementById('adminSystemPrompt2').value.trim();
        const enableLogging = document.getElementById('enableLogging').checked;
        const logTimestamps = document.getElementById('logTimestamps').checked;

        if (!apiKey) {
            this.showError('Lütfen geçerli bir Groq API anahtarı girin');
            return;
        }

        if (!systemPrompt1) {
            this.showError('Lütfen Chatbot 1 için bir sistem istemi girin');
            return;
        }

        if (!systemPrompt2) {
            this.showError('Lütfen Chatbot 2 için bir sistem istemi girin');
            return;
        }

        localStorage.setItem('groq_api_key', apiKey);
        localStorage.setItem('system_prompt_chatbot1', systemPrompt1);
        localStorage.setItem('system_prompt_chatbot2', systemPrompt2);
        localStorage.setItem('enable_logging', enableLogging.toString());
        localStorage.setItem('log_timestamps', logTimestamps.toString());

        this.showSuccess('Ayarlar başarıyla kaydedildi!');
    }

    loadChatLogs() {
        const saved = localStorage.getItem('chat_logs');
        this.chatLogs = saved ? JSON.parse(saved) : [];
    }

    updateStats() {
        const totalConversations = this.chatLogs.length;
        const totalMessages = this.chatLogs.reduce((sum, log) => sum + log.messages.length, 0);
        
        const today = new Date().toDateString();
        const todayMessages = this.chatLogs
            .filter(log => new Date(log.timestamp).toDateString() === today)
            .reduce((sum, log) => sum + log.messages.length, 0);

        document.getElementById('totalConversations').textContent = totalConversations;
        document.getElementById('totalMessages').textContent = totalMessages;
        document.getElementById('todayMessages').textContent = todayMessages;
    }

    renderChatLogs() {
        const container = document.getElementById('adminLogsList');
        
        if (this.chatLogs.length === 0) {
            container.innerHTML = '<div class="no-logs">Hiç sohbet bulunamadı</div>';
            return;
        }

        container.innerHTML = this.chatLogs.map(log => {
            const messageCount = log.messages.length;
            const lastMessage = log.messages[log.messages.length - 1];
            const timestamp = new Date(log.timestamp).toLocaleString();
            const chatbotName = log.chatbotName || `Chatbot ${log.chatbotId || 1}`;
            const chatbotColor = log.chatbotId === 2 ? '#34c759' : '#007aff';
            
            return `
                <div class="log-item">
                    <div class="log-info">
                        <div class="log-title">
                            <span class="chatbot-badge" style="background: ${chatbotColor}">${chatbotName}</span>
                            ${log.title}
                        </div>
                        <div class="log-meta">
                            ${messageCount} messages • ${timestamp}
                            ${lastMessage ? `• Last: "${lastMessage.content.substring(0, 50)}..."` : ''}
                        </div>
                    </div>
                    <div class="log-actions">
                        <button class="view-btn" onclick="adminPanel.viewChatDetail('${log.id}')">Görüntüle</button>
                        <button class="delete-btn" onclick="adminPanel.deleteChatLog('${log.id}')">Sil</button>
                    </div>
                </div>
            `;
        }).join('');

        this.updateStats();
    }

    viewChatDetail(chatId) {
        const chat = this.chatLogs.find(log => log.id === chatId);
        if (!chat) return;

        const modal = document.getElementById('chatModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        const chatbotName = chat.chatbotName || `Chatbot ${chat.chatbotId || 1}`;
        modalTitle.textContent = `${chatbotName}: ${chat.title}`;
        
        modalContent.innerHTML = chat.messages.map(message => {
            const timestamp = new Date(chat.timestamp).toLocaleString();
            return `
                <div class="modal-message ${message.role}">
                    <div>${message.content}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
            `;
        }).join('');

        modal.classList.add('visible');
    }

    deleteChatLog(chatId) {
        if (!confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) return;

        this.chatLogs = this.chatLogs.filter(log => log.id !== chatId);
        localStorage.setItem('chat_logs', JSON.stringify(this.chatLogs));
        this.renderChatLogs();
        this.showSuccess('Sohbet başarıyla silindi');
    }

    clearAllAdminLogs() {
        if (!confirm('TÜM sohbetleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

        this.chatLogs = [];
        localStorage.setItem('chat_logs', JSON.stringify(this.chatLogs));
        this.renderChatLogs();
        this.showSuccess('Tüm sohbetler silindi');
    }

    exportLogs() {
        if (this.chatLogs.length === 0) {
            this.showError('Dışa aktarılacak sohbet yok');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalConversations: this.chatLogs.length,
            conversations: this.chatLogs
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatbot-kayitlari-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Kayıtlar başarıyla dışa aktarıldı');
    }

    searchLogs() {
        const query = document.getElementById('logsSearch').value.toLowerCase();
        const filteredLogs = this.chatLogs.filter(log => 
            log.title.toLowerCase().includes(query) ||
            log.messages.some(msg => msg.content.toLowerCase().includes(query))
        );

        const container = document.getElementById('adminLogsList');
        
        if (filteredLogs.length === 0) {
            container.innerHTML = '<div class="no-logs">Aramanızla eşleşen sohbet bulunamadı</div>';
            return;
        }

        container.innerHTML = filteredLogs.map(log => {
            const messageCount = log.messages.length;
            const lastMessage = log.messages[log.messages.length - 1];
            const timestamp = new Date(log.timestamp).toLocaleString();
            const chatbotName = log.chatbotName || `Chatbot ${log.chatbotId || 1}`;
            const chatbotColor = log.chatbotId === 2 ? '#34c759' : '#007aff';
            
            return `
                <div class="log-item">
                    <div class="log-info">
                        <div class="log-title">
                            <span class="chatbot-badge" style="background: ${chatbotColor}">${chatbotName}</span>
                            ${log.title}
                        </div>
                        <div class="log-meta">
                            ${messageCount} messages • ${timestamp}
                            ${lastMessage ? `• Last: "${lastMessage.content.substring(0, 50)}..."` : ''}
                        </div>
                    </div>
                    <div class="log-actions">
                        <button class="view-btn" onclick="adminPanel.viewChatDetail('${log.id}')">Görüntüle</button>
                        <button class="delete-btn" onclick="adminPanel.deleteChatLog('${log.id}')">Sil</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-message';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
}

// Global functions for HTML handlers
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'yildiz' && password === 'yildiz1705') {
        sessionStorage.setItem('admin_logged_in', 'true');
        adminPanel.isLoggedIn = true;
        adminPanel.showAdminPanel();
    } else {
        adminPanel.showError('Geçersiz kullanıcı adı veya şifre');
    }
}

function logout() {
    sessionStorage.removeItem('admin_logged_in');
    adminPanel.isLoggedIn = false;
    adminPanel.showLoginPanel();
}

function showSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    
    adminPanel.currentSection = sectionName;
}

function saveAdminSettings() {
    adminPanel.saveAdminSettings();
}

function clearAllAdminLogs() {
    adminPanel.clearAllAdminLogs();
}

function exportLogs() {
    adminPanel.exportLogs();
}

function searchLogs() {
    adminPanel.searchLogs();
}

function closeChatModal() {
    document.getElementById('chatModal').classList.remove('visible');
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Auto-refresh chat logs every 30 seconds
setInterval(() => {
    if (adminPanel.isLoggedIn && adminPanel.currentSection === 'chat-logs') {
        adminPanel.loadChatLogs();
        adminPanel.renderChatLogs();
    }
}, 30000);