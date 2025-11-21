let ElevenLabs = null;
try {
  // Try different import methods for ElevenLabs
  const elevenLabsModule = require('@elevenlabs/elevenlabs-js');
  ElevenLabs = elevenLabsModule.ElevenLabs || elevenLabsModule.default || elevenLabsModule;

  // Test if it's actually a constructor
  if (typeof ElevenLabs !== 'function') {
    console.warn('ElevenLabs is not a constructor, disabling voice features');
    ElevenLabs = null;
  }
} catch (error) {
  console.warn('ElevenLabs module import failed:', error.message);
  ElevenLabs = null;
}

let elevenLabsClient = null;

const initializeElevenLabs = () => {
  // Early return if ElevenLabs is not available
  if (!ElevenLabs) {
    console.log('⚠️  ElevenLabs module not available - Voice features disabled');
    return false;
  }

  if (!process.env.ELEVEN_LABS_API_KEY || !process.env.ELEVEN_LABS_API_KEY.startsWith('sk_')) {
    console.log('⚠️  Eleven Labs API key not provided - Voice features disabled');
    return false;
  }

  try {
    elevenLabsClient = new ElevenLabs({
      apiKey: process.env.ELEVEN_LABS_API_KEY
    });
    console.log('✅ Eleven Labs voice service initialized');
    return true;
  } catch (error) {
    console.log('⚠️  Eleven Labs initialization failed - Voice features disabled');
    console.error('ElevenLabs error:', error.message);
    return false;
  }
};

const generateVoice = async (text) => {
  if (!elevenLabsClient) {
    throw new Error('Voice service not available');
  }

  // Generate audio using Eleven Labs
  const audioResponse = await elevenLabsClient.textToSpeech.convert({
    voice_id: "pNInz6obpgDQGcFmaJgB", // Female voice (Rachel)
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  });

  return audioResponse;
};

const getAvailableVoices = async () => {
  if (!elevenLabsClient) {
    throw new Error('Voice service not available');
  }

  const voices = await elevenLabsClient.voices.getAll();
  return voices.voices;
};

const isElevenLabsAvailable = () => !!elevenLabsClient;

module.exports = {
  initializeElevenLabs,
  generateVoice,
  getAvailableVoices,
  isElevenLabsAvailable
};