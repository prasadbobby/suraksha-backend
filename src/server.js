const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import middleware
const { requestLogger, corsMiddleware } = require('./middleware/logging');

// Import services
const { initializeTwilio, isTwilioAvailable } = require('./services/smsService');
const { initializeElevenLabs, isElevenLabsAvailable } = require('./services/voiceService');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const locationRoutes = require('./routes/locationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const userRoutes = require('./routes/userRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const testRoutes = require('./routes/test');

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);
app.use(corsMiddleware);

// Test route to debug CORS
app.get('/test', (req, res) => {
  console.log('✅ TEST ROUTE HIT!');
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/test', testRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Suraksha API is running',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      twilio: isTwilioAvailable(),
      elevenlabs: isElevenLabsAvailable()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database
    await connectDB();

    // Initialize external services
    initializeTwilio();
    initializeElevenLabs();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Suraksha API server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;