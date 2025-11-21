const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createAlert,
  getAlerts
} = require('../controllers/emergencyController');

const router = express.Router();

router.use(authenticateToken);

router.post('/alert', createAlert);
router.get('/alerts', getAlerts);

module.exports = router;