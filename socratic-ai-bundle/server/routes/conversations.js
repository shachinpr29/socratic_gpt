const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');

// In-memory storage fallback (user-specific)
const userInMemoryConversations = new Map(); // userId -> conversations
let nextId = 1;

// Export for use in other modules
const getInMemoryConversations = (userId) => {
  return userInMemoryConversations.get(userId) || [];
};

// GET /api/conversations - List user's conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const conversations = await Conversation.find({ user: req.user._id })
        .select('_id title updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .limit(50);
      res.json(conversations);
    } else {
      // Fallback to in-memory storage
      const userConvs = getInMemoryConversations(req.user._id);
      res.json(userConvs.map(conv => ({
        _id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      })));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Helper to check if DB is connected
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// GET /api/conversations/:id - Get full conversation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    } else {
      // Fallback to in-memory storage
      const userConvs = getInMemoryConversations(req.user._id);
      const conversation = userConvs.find(c => c.id === req.params.id || c._id === req.params.id);
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      res.json({ success: true });
    } else {
      // Fallback to in-memory storage
      const userConvs = getInMemoryConversations(req.user._id);
      const filtered = userConvs.filter(c => c.id !== req.params.id && c._id !== req.params.id);
      userInMemoryConversations.set(req.user._id, filtered);
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// DELETE /api/conversations - Clear user's conversations
router.delete('/', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      await Conversation.deleteMany({ user: req.user._id });
      res.json({ success: true });
    } else {
      // Fallback to in-memory storage
      userInMemoryConversations.set(req.user._id, []);
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
});

// Export helper functions for other routes
async function saveConversation(conversationData, userId, conversationId = null) {
  if (isDbConnected()) {
    if (conversationId) {
      // Update existing conversation
      try {
        // First try to find the conversation
        const existingConv = await Conversation.findOne({ _id: conversationId, user: userId });
        
        if (existingConv) {
          // Update existing conversation
          Object.assign(existingConv, conversationData);
          await existingConv.save();
          return existingConv;
        } else {
          // Create new conversation if not found
          const conversation = new Conversation({ ...conversationData, user: userId });
          return await conversation.save();
        }
      } catch (error) {
        console.error('Error updating conversation:', error);
        // Fallback to creating new conversation
        const conversation = new Conversation({ ...conversationData, user: userId });
        return await conversation.save();
      }
    } else {
      // Create new conversation
      const conversation = new Conversation({ ...conversationData, user: userId });
      return await conversation.save();
    }
  } else {
    // Fallback to in-memory storage
    const userConvs = getInMemoryConversations(userId);
    
    if (conversationId) {
      // Update existing conversation
      const existingConv = userConvs.find(c => c._id === conversationId || c.id === conversationId);
      if (existingConv) {
        Object.assign(existingConv, conversationData);
        return existingConv;
      }
    }
    
    // Create new conversation
    const conv = {
      id: nextId++,
      ...conversationData,
      user: userId,
      _id: nextId - 1
    };
    userConvs.push(conv);
    userInMemoryConversations.set(userId, userConvs);
    return conv;
  }
}

module.exports = router;
module.exports.saveConversation = saveConversation;
