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

## Troubleshooting
- If you see "chatbot yapılandırılıyor", check that the GROQ_API_KEY environment variable is set correctly
- Check Vercel function logs for any errors
- Ensure the API key is valid and has not exceeded its rate limits