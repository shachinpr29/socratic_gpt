# Socratic AI - Deployment Guide

## Quick Setup (5 minutes)

### 1. Start the Server
```bash
cd socratic-ai-bundle/server
npm install
npm run dev
```
Server will run on http://localhost:5000

### 2. Start the Client
```bash
cd socratic-ai-bundle/client
npm install
npm start
```
Client will run on http://localhost:3000

### 3. Access the Application
Open http://localhost:3000 in your browser

## Features Working
✅ Chat interface with Socratic AI responses
✅ Conversation saving and loading
✅ Beautiful UI with dark theme
✅ Real-time server status indicator
✅ Error handling and retry logic
✅ Mock AI responses (no API key needed)

## For Your College Submission

### What to Include:
1. **Source Code**: The entire `socratic-ai-bundle` folder
2. **README**: Explain the project structure
3. **Demo Video**: Show the chat interface working
4. **Documentation**: Brief explanation of the Socratic Method implementation

### Key Points to Highlight:
- **React Frontend**: Modern chat interface
- **Node.js/Express Backend**: RESTful API
- **MongoDB Integration**: Conversation persistence
- **Socratic Method**: AI responses that guide learning through questions
- **Error Handling**: Robust retry logic and user feedback
- **Responsive Design**: Works on all screen sizes

### Troubleshooting Tips:
- If server shows 500 errors, restart it with `npm run dev`
- If MongoDB connection fails, app uses in-memory storage automatically
- Check server status indicator (🟢 = online, 🔴 = offline)

### Default Configuration:
- Server: http://localhost:5000
- Client: http://localhost:3000
- Database: MongoDB (fallback to memory)
- AI: Mock responses (add Hugging Face token for real AI)

## Project Structure
```
socratic-ai-bundle/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.js   # Main React component
│   │   └── App.css  # Styling
│   └── package.json
├── server/          # Node.js backend
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── models/      # Data models
│   └── index.js     # Server entry point
└── README.md
```

## Technical Features Implemented:
1. **Frontend**: React hooks, state management, error boundaries
2. **Backend**: Express.js, RESTful API, error handling
3. **Database**: Mongoose ODM, fallback to in-memory storage
4. **AI Integration**: Hugging Face API with mock fallback
5. **UI/UX**: Modern dark theme, responsive design, loading states
6. **Reliability**: Retry logic, health checks, graceful degradation

Good luck with your submission! 🎓
