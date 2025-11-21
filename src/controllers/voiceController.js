const { generateVoice, getAvailableVoices, isElevenLabsAvailable } = require('../services/voiceService');

const generateVoiceAudio = async (req, res) => {
  try {
    const { text, command } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!isElevenLabsAvailable()) {
      return res.status(503).json({ error: 'Voice service not available' });
    }

    // Generate audio using Eleven Labs
    const audioResponse = await generateVoice(text);

    // Set appropriate headers for audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="voice.mp3"'
    });

    // Stream the audio data
    audioResponse.pipe(res);

    console.log(`✅ Voice generated for command: ${command || 'general'}`);
  } catch (error) {
    console.error('Voice generation error:', error);
    res.status(500).json({ error: 'Failed to generate voice audio' });
  }
};

const getVoices = async (req, res) => {
  try {
    if (!isElevenLabsAvailable()) {
      return res.status(503).json({ error: 'Voice service not available' });
    }

    const voices = await getAvailableVoices();
    res.json({ success: true, voices });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: 'Failed to fetch available voices' });
  }
};

module.exports = {
  generateVoiceAudio,
  getVoices
};