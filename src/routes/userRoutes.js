const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getProfile,
  updateProfile
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;