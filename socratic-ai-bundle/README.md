# 🏛️ Socratic AI — Full-Stack Chatbot with Hugging Face LLM

A ChatGPT-like chatbot built with **React + Node.js + Express + MongoDB Atlas**, powered entirely by a **free Hugging Face open-source LLM** — guided by the **Socratic Method**.

---

## 🧠 AI Model — Hugging Face Inference API

| Model | Size | Tier | Best For |
|-------|------|------|----------|
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | **Free** ← default | Reasoning, dialogue |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | **Free** (fallback) | Fast responses |
| `meta-llama/Llama-3.3-70B-Instruct` | 70B | PRO ($9/mo) | Best quality |

**No paid API key required.** A free Hugging Face account gives you hundreds of requests/hour.

---

## ✨ Features

- **Socratic Method Engine** — Elenchus, Maieutics, Aporia & Dialectic
- **Technical + Non-Technical** — Coding, math, philosophy, ethics
- **Auto-fallback** — If primary model is busy, switches to Mistral-7B automatically
- **Conversation History** — Stored in MongoDB Atlas, auto-titled
- **Response Badges** — Inquiry / Challenge / Clarify / Synthesis / Direct
- **Markdown + Syntax Highlighting** — Full code block support

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, react-markdown, react-syntax-highlighter |
| Backend | Node.js, Express.js, Axios |
| Database | MongoDB Atlas (Mongoose) |
| AI | Hugging Face Inference API (Llama 3.1 / Mistral) |

---

## 🚀 Quick Start

### Step 1 — Get a Free Hugging Face Token

1. Go to [huggingface.co](https://huggingface.co) → Sign up (free)
2. Go to **Settings → Access Tokens → New Token**
3. Name it anything, select **"Read"** role
4. Enable **"Make calls to the serverless Inference API"** permission
5. Copy the token (starts with `hf_...`)

### Step 2 — MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → Free cluster
2. Create a DB user and whitelist your IP
3. Copy the connection string

### Step 3 — Backend

```bash
cd server
npm install

cp .env.example .env
# Edit .env — fill in MONGODB_URI and HF_TOKEN
```

**.env file:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/socratic_ai
CLIENT_URL=http://localhost:3000
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

```bash
npm run dev    # development (auto-restart)
npm start      # production
```

### Step 4 — Frontend

```bash
cd client
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
socratic-ai/
├── README.md
├── server/
│   ├── index.js                     # Express entry point
│   ├── package.json                 # axios, express, mongoose, dotenv
│   ├── .env.example
│   ├── models/
│   │   └── Conversation.js          # MongoDB schema
│   ├── routes/
│   │   ├── chat.js                  # POST /api/chat
│   │   └── conversations.js         # GET/DELETE /api/conversations
│   └── services/
│       └── socraticEngine.js        # HF Inference API + Socratic prompt
│
└── client/
    ├── package.json
    ├── .env.example
    ├── public/index.html
    └── src/
        ├── index.js
        ├── App.js                   # Full chat UI
        └── App.css                  # Dark scholarly theme
```

---

## 🔄 Switching Models

To use a different model, just change `.env`:

```env
# Lightweight & fast (free)
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3

# Best quality (requires HF PRO at $9/mo)
HF_MODEL=meta-llama/Llama-3.3-70B-Instruct

# Great reasoning, free
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

No code changes needed — the engine uses `process.env.HF_MODEL`.

---

## 🧠 Socratic Method in Action

| Principle | Description |
|-----------|-------------|
| **Maieutics** | Help users "give birth" to their own understanding |
| **Elenchus** | Cross-examine assumptions with probing questions |
| **Aporia** | Lead to productive confusion — beginning of wisdom |
| **Dialectic** | Build understanding through back-and-forth |
| **Humility** | Acknowledge complexity, no dogma |

### Technical Example
> **User**: "How do I sort an array in JavaScript?"
>
> **Socratic AI**: "Interesting question — but before we look at the answer, **what do you think 'sorting' actually requires a computer to do?** Does it need to compare items? How many comparisons do you imagine it might take for 10 items? Think about that, then consider: JavaScript arrays have a built-in `.sort()` method. **Do you know what algorithm it uses under the hood, and why that might matter?**"

### Philosophical Example
> **User**: "Is AI conscious?"
>
> **Socratic AI**: "That's a question worth examining carefully. First — **what do you mean by 'conscious'?** Philosophers disagree on this even for humans. If you mean 'has subjective experience', how would we test for that? **What evidence would convince you either way?**"

---

## 🌐 Deployment

**Backend** (Railway / Render / Fly.io):
- Set all env vars in the dashboard
- Start command: `npm start`

**Frontend** (Vercel / Netlify):
- Set `REACT_APP_API_URL=https://your-backend-url/api`
- Build command: `npm run build`, output: `build/`

---

## ⚠️ Notes on Free Tier

- HF free tier allows ~a few hundred requests/hour per user
- First request may be slow (model cold start, ~10–30s) — subsequent ones are fast
- The engine auto-retries with `Mistral-7B` if the primary model times out
- For production, consider HF PRO ($9/mo) or a dedicated Inference Endpoint
