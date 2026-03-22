require("dotenv").config();
const axios = require("axios");

// ─────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────
const MODELS = {
  primary: process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
  fallback: "mistralai/Mistral-7B-Instruct-v0.3",
};

const HF_BASE_URL = "https://router.huggingface.co/v1";

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a Socratic tutor.

Rules:
- Ask ONE question at a time
- Use simple English
- Do NOT give direct answers unless user insists
`;

// ─────────────────────────────────────────────
// Build Messages
// ─────────────────────────────────────────────
function buildMessages(history, userMessage) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  history.slice(-10).forEach((msg) => {
    messages.push({ role: msg.role, content: msg.content });
  });

  messages.push({ role: "user", content: userMessage });
  return messages;
}

// ─────────────────────────────────────────────
// Call Hugging Face
// ─────────────────────────────────────────────
async function callHuggingFace(messages, model) {
  try {
    const response = await axios.post(
      `${HF_BASE_URL}/chat/completions`,
      {
        model,
        messages,
        temperature: 0.5,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ HF ERROR:", error.response?.data || error.message);
    throw new Error("HF API failed");
  }
}

// ─────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────
async function generateSocraticResponse(
  history,
  userMessage
) {
  try {
    const messages = buildMessages(history, userMessage);
    const response = await callHuggingFace(messages, MODELS.primary);

    return {
      content: response,
      socraticType: "question",
    };
  } catch (error) {
    return {
      content: "❌ Something went wrong. Please try again.",
      socraticType: "error",
    };
  }
}

// ─────────────────────────────────────────────
// TITLE GENERATOR
// ─────────────────────────────────────────────
async function generateTitle(firstMessage) {
  try {
    const messages = [
      { role: "system", content: "Generate short title (3-5 words)" },
      { role: "user", content: firstMessage },
    ];

    const title = await callHuggingFace(messages, MODELS.primary);
    return title.replace(/["']/g, "").trim();
  } catch {
    return firstMessage.slice(0, 30);
  }
}

module.exports = {
  generateSocraticResponse,
  generateTitle,
};