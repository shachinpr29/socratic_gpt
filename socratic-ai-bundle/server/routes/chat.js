const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const Conversation = require('../models/Conversation');
const { generateSocraticResponse, generateTitle } = require('../services/socraticEngine');
const { saveConversation } = require('./conversations');

// Helper: check DB connection
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// POST /api/chat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    let conversation;
    const userMessage = message.trim();

    // ─────────────────────────────
    // 1. Get or create conversation
    // ─────────────────────────────
    if (conversationId && isDbConnected()) {
      conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conversation = new Conversation({
        messages: [],
        title: 'New Conversation',
        user: req.user._id
      });
    }

    console.log("User:", userMessage);

    // ─────────────────────────────
    // 2. Prepare history
    // ─────────────────────────────
    const history = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // ─────────────────────────────
    // 3. Generate Socratic response
    // ─────────────────────────────
    const { content, socraticType } = await generateSocraticResponse(
      history,
      userMessage
    );

    console.log("Bot:", content);

    // ─────────────────────────────
    // 4. Save messages
    // ─────────────────────────────
    conversation.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    conversation.messages.push({
      role: 'assistant',
      content,
      socraticType,
      timestamp: new Date()
    });

    // ─────────────────────────────
    // 5. Generate title (first message)
    // ─────────────────────────────
    if (conversation.messages.length === 2) {
      try {
        conversation.title = await generateTitle(userMessage);
      } catch {
        conversation.title = "New Conversation";
      }
    }

    // ─────────────────────────────
    // 6. Save to DB
    // ─────────────────────────────
    const savedConversation = await saveConversation({
      title: conversation.title,
      messages: conversation.messages,
      topic: conversation.topic || '',
      createdAt: conversation.createdAt || new Date(),
      updatedAt: new Date()
    }, req.user._id, conversationId);

    // ─────────────────────────────
    // 7. Send response
    // ─────────────────────────────
    return res.json({
      conversationId: savedConversation._id,
      message: {
        role: 'assistant',
        content,
        socraticType
      },
      title: savedConversation.title
    });

  } catch (error) {
    console.error('Chat error:', error);

    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

module.exports = router;