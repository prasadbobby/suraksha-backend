const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  sendEmergencyAlert,
  sendLocationUpdate,
  saveNotificationToken
} = require('../controllers/firebaseController');

// POST /api/firebase/emergency - Send emergency notification to trusted contacts
router.post('/emergency', authenticateToken, sendEmergencyAlert);

// POST /api/firebase/location - Send location sharing notification
router.post('/location', authenticateToken, sendLocationUpdate);

// POST /api/firebase/token - Save user's notification token
router.post('/token', authenticateToken, saveNotificationToken);

module.exports = router;