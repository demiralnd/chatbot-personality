# Vercel Deployment Instructions

## Prerequisites
- A Vercel account
- A Groq API key from https://console.groq.com

## Deployment Steps

1. **Deploy to Vercel**
   - Click the Deploy button or manually deploy from GitHub/Git
   - Connect your repository to Vercel

2. **Set Environment Variable**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following variable:
     - Name: `GROQ_API_KEY`
     - Value: `[Your Groq API key]`
   - Make sure to add it for Production, Preview, and Development environments

3. **Verify Deployment**
   - Once deployed, visit your site URL
   - The chatbot should no longer display "chatbot yapılandırılıyor"
   - It should be ready to accept messages

## How It Works
- The API key is stored securely in Vercel's environment variables
- The `/api/chat` endpoint handles all chat requests server-side
- The API key is never exposed to the client/browser
- All users can use the chatbot without needing their own API key

## Admin Panel Features

### Configuration Management
- **Admin URL**: `https://your-site.com/admin.html`
- **Login**: Username: `admin`, Password: `admin123`
- **Instant Updates**: Configuration changes apply immediately to all users
- **System Prompts**: Set different prompts for Chatbot 1 and Chatbot 2
- **Logging Controls**: Enable/disable conversation logging

### Session Monitoring
- **All Conversations**: View every conversation from all users and devices
- **Device Information**: See IP addresses, browsers, and operating systems
- **Real-time Updates**: Logs update automatically as users interact
- **Export Data**: Download all conversation data for research analysis
- **Clear Logs**: Remove all conversation history when needed

### Research Capabilities
- **Global Configuration**: Set research prompts that apply to all participants
- **Multi-Device Tracking**: Monitor conversations across different devices
- **User Behavior Analysis**: Track conversation patterns and user interactions
- **Data Export**: Export conversation data in JSON format for analysis

## Testing
1. Open the deployed URL
2. Type a message in the chat
3. The chatbot should respond using the Groq API

## Configuration Persistence Solutions

### Option 1: For Research Sessions (Recommended)
- **How it works**: Configuration persists during active sessions (typically 2-4 hours)
- **Best for**: Research studies, testing sessions, temporary configurations
- **Steps**: 
  1. Deploy to Vercel
  2. Use admin panel to set configuration
  3. Configuration will persist during active research sessions

### Option 2: For Permanent Persistence
- **How it works**: Set configuration via environment variables
- **Best for**: Long-term deployments, permanent configurations
- **Steps**:
  1. Go to Vercel project settings → Environment Variables
  2. Add these variables:
     ```
     SYSTEM_PROMPT_1=Your prompt for chatbot 1
     SYSTEM_PROMPT_2=Your prompt for chatbot 2
     ENABLE_LOGGING=true
     LOG_TIMESTAMPS=true
     ```
  3. Redeploy your project

### Option 3: For Complete Persistence
- **How it works**: Save your configuration and set it as environment variable
- **Best for**: Research with guaranteed persistence
- **Steps**:
  1. Configure your prompts in admin panel
  2. Copy the configuration JSON from console logs
  3. Set as environment variable:
     ```
     CHATBOT_SAVED_CONFIG={"systemPrompt1":"Your prompt 1","systemPrompt2":"Your prompt 2","enableLogging":true,"logTimestamps":true}
     ```

### Chat Logs Persistence
- Logs are stored in server memory during active sessions
- For permanent storage, consider integrating with:
  - Vercel KV (Redis)
  - Supabase
  - MongoDB Atlas
  - PostgreSQL

## Troubleshooting
- If you see "chatbot yapılandırılıyor", check that the GROQ_API_KEY environment variable is set correctly
- Check Vercel function logs for any errors
- Ensure the API key is valid and has not exceeded its rate limits
- If configuration resets, it's due to function instance recycling - use environment variables for persistent defaults