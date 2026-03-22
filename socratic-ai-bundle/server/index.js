const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversations');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socratic_ai';

let dbConnected = false;

// Set connection options for reliable local MongoDB
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  bufferCommands: false, // Disable buffering
};

// Connect to MongoDB with proper error handling
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    dbConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running in memory-only mode (conversations won\'t persist)');
    dbConnected = false;
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
  dbConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  dbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected, switching to memory mode');
  dbConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  dbConnected = true;
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Socratic AI Server Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Socratic AI Server running on port ${PORT}`);
});
