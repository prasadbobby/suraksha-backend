const express = require('express');
const {
  generateVoiceAudio,
  getVoices
} = require('../controllers/voiceController');

const router = express.Router();

router.post('/generate', generateVoiceAudio);
router.get('/voices', getVoices);

module.exports = router;