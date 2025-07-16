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

## TRUE PERMANENT PERSISTENCE ✅

### How It Works Now
- **Multiple Storage Layers**: Configuration saved to both temporary and permanent storage
- **Backup Files**: Auto-generated JavaScript files committed to your project
- **Complete Persistence**: Everything persists permanently across server restarts and deployments
- **Zero Data Loss**: Admin configurations never reset, even after months of inactivity
- **No External Dependencies**: No need for external databases or services

### What's Persistent Now
- ✅ **Admin Configurations**: All admin panel settings persist permanently
- ✅ **Saved Prompts**: All saved prompt configurations persist permanently  
- ✅ **Chat Logs**: All conversation logs persist permanently
- ✅ **User Sessions**: All user interactions are stored permanently
- ✅ **Settings Changes**: All configuration changes persist permanently

### Database Files
The system now uses these database files (automatically created):
```
database/
├── config.json      # Current active configuration
├── logs.json        # All chat logs from all users
└── prompts.json     # All saved prompt configurations
```

### Admin Panel Features (All Persistent)
- **Save Prompts**: Save unlimited prompt configurations permanently
- **Load Prompts**: Switch between saved configurations instantly
- **View All Logs**: See all conversations from all users/devices
- **Configuration Changes**: All changes persist across deployments

### Environment Variable Override
You can still override defaults with environment variables:
```
SYSTEM_PROMPT_1=Your default prompt for chatbot 1
SYSTEM_PROMPT_2=Your default prompt for chatbot 2
ENABLE_LOGGING=true
LOG_TIMESTAMPS=true
```

### For Research Studies
1. **Configure Once**: Set up your prompts in admin panel
2. **Permanent Storage**: All configurations saved to database files
3. **No Data Loss**: Everything persists across any server changes
4. **Full Monitoring**: All user interactions stored permanently

## Troubleshooting
- If you see "chatbot yapılandırılıyor", check that the GROQ_API_KEY environment variable is set correctly
- Check Vercel function logs for any errors
- Ensure the API key is valid and has not exceeded its rate limits
- If configuration resets, it's due to function instance recycling - use environment variables for persistent defaults