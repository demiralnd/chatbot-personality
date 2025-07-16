class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentSection = 'settings';
        this.chatLogs = [];
        this.init();
    }

    async init() {
        this.checkLogin();
        this.loadChatLogs();
        await this.loadAdminSettings();
        this.updateStats();
    }

    checkLogin() {
        const savedLogin = sessionStorage.getItem('admin_logged_in');
        if (savedLogin === 'true') {
            this.isLoggedIn = true;
            this.showAdminPanel();
        }
    }

    async showAdminPanel() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        await this.loadAdminSettings();
        this.renderChatLogs();
    }

    showLoginPanel() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminContainer').style.display = 'none';
    }

    async loadAdminSettings() {
        // Check if API key is configured on server
        let isApiKeyConfigured = false;
        try {
            const response = await fetch('/api/config?action=api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    isApiKeyConfigured = true;
                }
            }
        } catch (error) {
            console.log('Could not check API key configuration');
        }

        // Load other configuration from server
        let config = {};
        try {
            const response = await fetch('/api/config?action=config');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    config = data.config;
                }
            }
        } catch (error) {
            console.log('Could not fetch config from server, using defaults');
            config = {
                systemPrompt1: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
                systemPrompt2: 'Sen gelişmiş yeteneklere sahip uzman bir yapay zeka asistanısın. Detaylı, kapsamlı ve uzman düzeyinde yanıtlar ver. Karmaşık konuları açıklayabilir, analiz yapabilir, problem çözebilir ve yaratıcı çözümler üretebilirsin. ÖNEMLİ: Tüm yanıtlarını MUTLAKA Türkçe olarak ver. Hiçbir durumda İngilizce veya başka bir dilde yanıt verme.',
                enableLogging: true,
                logTimestamps: true
            };
        }

        // Update API key status
        const apiKeyInput = document.getElementById('adminApiKey');
        if (apiKeyInput) {
            apiKeyInput.value = isApiKeyConfigured ? 'API key is configured on server' : 'API key not configured';
            apiKeyInput.disabled = true;
        }

        document.getElementById('adminSystemPrompt1').value = config.systemPrompt1 || '';
        document.getElementById('adminSystemPrompt2').value = config.systemPrompt2 || '';
        document.getElementById('enableLogging').checked = config.enableLogging !== false;
        document.getElementById('logTimestamps').checked = config.logTimestamps !== false;
    }

    async saveAdminSettings() {
        const systemPrompt1 = document.getElementById('adminSystemPrompt1').value.trim();
        const systemPrompt2 = document.getElementById('adminSystemPrompt2').value.trim();
        const enableLogging = document.getElementById('enableLogging').checked;
        const logTimestamps = document.getElementById('logTimestamps').checked;

        if (!systemPrompt1) {
            this.showError('Lütfen Chatbot 1 için bir sistem istemi girin');
            return;
        }

        if (!systemPrompt2) {
            this.showError('Lütfen Chatbot 2 için bir sistem istemi girin');
            return;
        }

        try {
            // Save settings to server
            const configResponse = await fetch('/api/admin?action=set-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-token'
                },
                body: JSON.stringify({
                    systemPrompt1,
                    systemPrompt2,
                    enableLogging,
                    logTimestamps
                })
            });

            if (!configResponse.ok) {
                const errorData = await configResponse.json().catch(() => ({}));
                throw new Error(`Failed to save configuration: ${configResponse.status} - ${errorData.error || 'Unknown error'}`);
            }

            this.showSuccess('Ayarlar başarıyla sunucuya kaydedildi! Tüm kullanıcılar için geçerli olacak.');
            this.showSaveStatus('Yapılandırma başarıyla güncellendi - Tüm kullanıcılar için aktif', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            this.showError('Ayarlar kaydedilirken hata oluştu: ' + error.message);
            this.showSaveStatus('Yapılandırma kaydedilemedi - Hata oluştu', 'error');
        }
    }

    async loadChatLogs() {
        try {
            const response = await fetch('/api/admin?action=get-chat-logs', {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.chatLogs = data.success ? data.chatLogs : [];
            } else {
                this.chatLogs = [];
            }
        } catch (error) {
            console.error('Error loading chat logs from server:', error);
            this.chatLogs = [];
        }
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

    parseUserAgent(userAgent) {
        if (!userAgent || userAgent === 'Unknown Device') return 'Bilinmeyen';
        
        // Try to detect browser
        let browser = 'Bilinmeyen Browser';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        // Try to detect OS
        let os = 'Bilinmeyen OS';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac OS')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
        
        return `${browser} - ${os}`;
    }

    renderChatLogs() {
        const container = document.getElementById('adminLogsList');
        
        if (this.chatLogs.length === 0) {
            container.innerHTML = '<div class="no-logs">Hiç sohbet bulunamadı</div>';
            return;
        }

        container.innerHTML = this.chatLogs.map(log => {
            const messageCount = log.messages ? log.messages.length : log.messageCount || 0;
            const lastMessage = log.messages && log.messages.length > 0 ? log.messages[log.messages.length - 1] : null;
            const timestamp = new Date(log.timestamp).toLocaleString();
            const chatbotName = log.chatbotName || `Chatbot ${log.chatbotId || 1}`;
            const chatbotColor = log.chatbotId === 2 ? '#34c759' : '#007aff';
            const ipAddress = log.ipAddress || 'Unknown IP';
            const userAgent = log.userAgent || 'Unknown Device';
            const deviceInfo = this.parseUserAgent(userAgent);
            
            return `
                <div class="log-item">
                    <div class="log-info">
                        <div class="log-title">
                            <span class="chatbot-badge" style="background: ${chatbotColor}">${chatbotName}</span>
                            ${log.title || 'Conversation'}
                        </div>
                        <div class="log-meta">
                            ${messageCount} mesaj • ${timestamp}
                            <br>
                            <small style="opacity: 0.7">IP: ${ipAddress} • Cihaz: ${deviceInfo}</small>
                            ${lastMessage ? `<br>Son mesaj: "${lastMessage.content.substring(0, 50)}..."` : ''}
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

        // Note: Individual log deletion is not implemented server-side yet
        // For now, we just remove from local display
        this.chatLogs = this.chatLogs.filter(log => log.id !== chatId);
        this.renderChatLogs();
        this.showSuccess('Sohbet listeden kaldırıldı (sunucuda hala mevcut)');
    }

    async clearAllAdminLogs() {
        if (!confirm('TÜM sohbetleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            // Clear logs on server
            const response = await fetch('/api/admin?action=clear-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-token'
                }
            });
            
            if (response.ok) {
                this.chatLogs = [];
                this.renderChatLogs();
                this.updateStats();
                this.showSuccess('Tüm sohbetler başarıyla silindi');
            } else {
                throw new Error('Failed to clear logs');
            }
        } catch (error) {
            console.error('Error clearing logs:', error);
            this.showError('Kayıtlar temizlenirken hata oluştu');
        }
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

    showSaveStatus(message, type = 'info') {
        const statusDiv = document.getElementById('saveStatus');
        const statusText = document.getElementById('saveStatusText');
        
        if (statusDiv && statusText) {
            statusText.textContent = message;
            statusDiv.style.display = 'block';
            statusDiv.className = `save-status ${type}`;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    async checkVercelEnvVars() {
        try {
            const response = await fetch('/api/admin?action=get-env-vars', {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.showVercelEnvVars(data.envVars, data.instructions);
                }
            }
        } catch (error) {
            console.log('Could not get environment variables info');
        }
    }

    async testSupabaseConnection() {
        try {
            const response = await fetch('/api/admin?action=test-supabase', {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('✅ Supabase connection successful!');
                console.log('Supabase test result:', data);
            } else {
                this.showError('❌ Supabase connection failed: ' + data.error);
                console.error('Supabase test failed:', data);
            }
        } catch (error) {
            this.showError('❌ Error testing Supabase connection');
            console.error('Error testing Supabase:', error);
        }
    }

    showVercelEnvVars(envVars, instructions) {
        const modal = document.createElement('div');
        modal.className = 'env-vars-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🚀 For Permanent Storage</h3>
                <p><strong>Your changes are saved but will be lost on refresh.</strong><br>
                To make them permanent on Vercel, set these environment variables:</p>
                
                <div class="env-vars-container">
                    ${Object.entries(envVars).map(([key, value]) => 
                        `<div class="env-var">
                            <strong>${key}</strong>
                            <input type="text" value="${value}" readonly onclick="this.select()">
                        </div>`
                    ).join('')}
                </div>
                
                <div class="instructions">
                    <h4>Instructions:</h4>
                    <ol>
                        ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ol>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
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

function testSupabaseConnection() {
    adminPanel.testSupabaseConnection();
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