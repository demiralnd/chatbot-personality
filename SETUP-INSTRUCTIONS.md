# Chatbot Configuration Setup Instructions

## Quick Setup for Research

### Step 1: Deploy to Vercel
1. Upload your project to Vercel
2. Set the `GROQ_API_KEY` environment variable
3. Deploy the project

### Step 2: Configure for Research
Choose one of these options:

#### Option A: Use Admin Panel (Temporary - Good for Research Sessions)
1. Go to `https://your-site.com/admin.html`
2. Login with: `admin` / `admin123`
3. Set your research prompts in the admin panel
4. Configuration persists during active sessions (2-4 hours)

#### Option B: Set Environment Variables (Permanent)
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
GROQ_API_KEY=your_groq_api_key_here
SYSTEM_PROMPT_1=Your research prompt for chatbot 1
SYSTEM_PROMPT_2=Your research prompt for chatbot 2
ENABLE_LOGGING=true
LOG_TIMESTAMPS=true
```

4. Redeploy your project

### Step 3: Test Your Setup
1. Visit your deployed URL
2. Test both chatbots
3. Check admin panel for logs
4. Verify configuration persists

## For Research Studies

### Before Starting Research:
1. Set up your prompts using Option B above
2. Test with multiple devices/browsers
3. Verify logs are collecting in admin panel
4. Share the main URL with participants

### During Research:
1. Monitor conversations in admin panel
2. Export logs as needed
3. Clear logs between sessions if needed

### After Research:
1. Export all conversation data
2. Clear logs if needed
3. Save configuration for future use

## Troubleshooting

### Configuration Not Persisting:
- Use Option B (environment variables) for guaranteed persistence
- Check Vercel function logs for errors
- Verify environment variables are set correctly

### Logs Not Showing:
- Check if logging is enabled in admin panel
- Verify API key is working
- Check browser console for errors

### Admin Panel Not Working:
- Verify you're using correct login (admin/admin123)
- Check if site is deployed correctly
- Try refreshing the page

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key | Yes |
| `SYSTEM_PROMPT_1` | Prompt for Chatbot 1 | Optional |
| `SYSTEM_PROMPT_2` | Prompt for Chatbot 2 | Optional |
| `ENABLE_LOGGING` | Enable chat logging | Optional |
| `LOG_TIMESTAMPS` | Include timestamps in logs | Optional |
| `CHATBOT_SAVED_CONFIG` | Full config JSON | Optional |