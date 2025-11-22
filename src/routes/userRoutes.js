const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updateSafetySettings,
  updateAlertPreferences
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/safety-settings', updateSafetySettings);
router.put('/alert-preferences', updateAlertPreferences);

module.exports = router;