const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  updateLocation,
  shareLocation
} = require('../controllers/locationController');

const router = express.Router();

router.use(authenticateToken);

router.post('/update', updateLocation);
router.post('/share', shareLocation);

module.exports = router;