# Chatbot Kişilik Çalışması

Groq API kullanarak Apple tasarım ilkelerinden ilham alan modern, minimalist bir chatbot uygulaması.

## Özellikler

- **Modern Arayüz**: Apple'ın tasarım dilinden ilham alan temiz, minimalist tasarım
- **Groq API Entegrasyonu**: Groq'un hızlı AI modelleri ile güçlendirilmiş
- **Çoklu Chatbot**: Farklı kişiliklere sahip 2 ayrı chatbot
- **Sohbet Kayıtları**: Tüm konuşmalar otomatik olarak kaydedilir ve görüntülenebilir
- **Sistem İstemi Yapılandırması**: Her chatbot için ayrı davranış tanımlaması
- **Responsive Tasarım**: Masaüstü ve mobil cihazlarda çalışır
- **Yerel Depolama**: Ayarlar ve sohbet geçmişi yerel olarak saklanır
- **Sunucu Tarafı Kayıt**: Vercel dağıtımı için API endpoint'leri

## Kurulum

1. Proje dosyalarını indirin
2. [Groq Console](https://console.groq.com/)'dan API anahtarınızı alın
3. `index.html`'i web tarayıcısında açın veya yerel olarak servis edin:

```bash
# Python 3 kullanarak
python3 -m http.server 8000

# Node.js kullanarak (http-server yüklüyse)
npx http-server

# Ardından http://localhost:8000 adresini ziyaret edin
```

## Kullanım

1. **Ayarları Yapılandırın**: Yönetim paneline giderek Groq API anahtarınızı ve sistem istemlerinizi girin
2. **Chatbot Seçin**: Ana sayfadan Chatbot 1 veya Chatbot 2'yi seçin
3. **Sohbet Edin**: Mesajınızı yazın ve Enter'a basın veya gönder butonuna tıklayın
4. **Sohbet Kayıtlarını Görüntüleyin**: Yönetim panelinden geçmiş konuşmaları inceleyebilirsiniz

## Dosya Yapısı

- `index.html` - Ana seçim sayfası
- `chatbot1.html` & `chatbot2.html` - Bireysel sohbet arayüzleri
- `admin.html` - Yönetim paneli
- `main-styles.css` - Ana sayfa için stil dosyası
- `styles.css` - Sohbet arayüzü stilleri (responsive)
- `admin-styles.css` - Yönetim paneli stilleri
- `chatbot-script.js` - Gelişmiş chatbot fonksiyonalitesi
- `admin-script.js` - Yönetim paneli fonksiyonalitesi
- `api/log-chat.js` - Sunucu tarafı kayıt endpoint'i
- `api/get-logs.js` - Sunucu tarafı kayıt alım endpoint'i
- `vercel.json` - Vercel dağıtım yapılandırması

## Teknik Detaylar

- Groq'un `llama-3.3-70b-versatile` modelini kullanır
- Konuşmalar tarayıcının localStorage'ında saklanır
- Responsive grid layout
- Modern CSS animasyonları ve geçişleri
- API hataları için hata yönetimi
- Türkçe dil desteği

## Yönetim Paneli Erişimi

- URL: `/admin.html`
- Kullanıcı Adı: `yildiz`
- Şifre: `yildiz1705`

## Vercel Dağıtımı

Proje Vercel'de dağıtıma hazırdır ve kapsamlı kayıt fonksiyonalitesi içerir:

1. Vercel hesabınıza bağlayın
2. Çevre değişkenlerini ayarlayın (gerekirse)
3. Dağıtın

## Tarayıcı Desteği

Aşağıdakileri destekleyen tüm modern tarayıcılarda çalışır:
- ES6 Classes
- Fetch API
- CSS Grid
- Local Storage

## Lisans

Bu proje eğitim ve araştırma amaçlı geliştirilmiştir.