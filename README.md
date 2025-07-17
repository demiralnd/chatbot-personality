# Chatbot Personality Study

A modern web application for conducting chatbot personality research using advanced AI models. This project enables comparative analysis of chatbot interactions with customizable system prompts and comprehensive logging capabilities.

## Features

- **Dual Chatbot Interface**: Two independent chatbot instances for comparative personality studies
- **Real-time AI Conversations**: Powered by Groq API using Meta Llama 4 Maverick model
- **Admin Dashboard**: Secure management panel for configuration and monitoring
- **Conversation Logging**: Comprehensive chat history with metadata tracking
- **Customizable System Prompts**: Configure unique personalities for each chatbot
- **Session Management**: Track user interactions across sessions
- **Export Functionality**: Download chat logs in JSON format for analysis
- **Responsive Design**: Modern, Apple-inspired UI that works on all devices

## Technologies & Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Google Fonts** - SF Pro Display typography

### Backend
- **Node.js** - Runtime environment
- **Vercel Functions** - Serverless API endpoints
- **Supabase** - Database and authentication
- **Groq API** - AI model integration

### Infrastructure
- **Vercel** - Hosting and deployment
- **Environment Variables** - Secure configuration
- **CORS** - Cross-origin resource sharing

## Programming Languages

- **JavaScript (ES6+)** - Primary language for both frontend and backend
- **HTML** - Markup for web pages
- **CSS** - Styling and animations
- **JSON** - Configuration and data storage

## Project Structure

```
├── api/                    # Serverless functions
│   ├── admin.js           # Admin authentication
│   ├── chat.js            # Chat API endpoint
│   ├── config.js          # Configuration management
│   ├── logs.js            # Chat logs API
│   └── lib/
│       └── database.js    # Supabase integration
├── database/              # Local database files
├── admin.html             # Admin dashboard
├── chatbot1.html          # First chatbot interface
├── chatbot2.html          # Second chatbot interface
├── index.html             # Landing page
├── package.json           # Dependencies
└── vercel.json           # Deployment configuration
```

## Key Capabilities

- **Academic Research**: Designed for personality and behavior studies
- **Real-time Processing**: Instant AI responses with streaming support
- **Data Privacy**: Secure handling of conversation data
- **Scalability**: Serverless architecture for handling multiple concurrent users
- **Extensibility**: Modular design for easy feature additions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Groq API key, Supabase credentials)
4. Run development server: `npm run dev`
5. Access at `http://localhost:8000`

## Deployment

This project is optimized for Vercel deployment with automatic serverless function setup and environment variable management.

---

*Developed for Anadolu University, Department of Public Relations and Advertising*