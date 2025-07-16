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

## Testing
1. Open the deployed URL
2. Type a message in the chat
3. The chatbot should respond using the Groq API

## Important Notes about Persistence

### Configuration Persistence
- **Current Implementation**: Configuration changes are stored in serverless function memory
- **Limitation**: Settings may reset when Vercel spins up new function instances (typically after periods of inactivity)
- **Recommendation**: For production research, consider:
  - Setting initial configuration via environment variables
  - Using a database solution (Vercel KV, Supabase, etc.)

### Setting Default Configuration
You can set default prompts via environment variables:
```bash
CHATBOT_CONFIG='{
  "systemPrompt1": "Your prompt for chatbot 1",
  "systemPrompt2": "Your prompt for chatbot 2",
  "enableLogging": true,
  "logTimestamps": true
}'
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