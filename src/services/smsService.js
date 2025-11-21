const twilio = require('twilio');

let twilioClient = null;

const initializeTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio SMS service initialized');
      return true;
    } catch (error) {
      console.log('⚠️  Twilio not configured - SMS notifications disabled');
      return false;
    }
  } else {
    console.log('⚠️  Twilio credentials not provided - SMS notifications disabled');
    return false;
  }
};

const sendEmergencySMS = async (contact, userInfo, location) => {
  if (!twilioClient) {
    console.log(`⚠️  SMS not sent to ${contact.phone} - Twilio not configured`);
    return false;
  }

  const message = `🚨 EMERGENCY ALERT: ${userInfo.name} needs immediate help! Phone: ${userInfo.phone || 'N/A'}${location ? ` Location: https://maps.google.com/maps?q=${location.latitude},${location.longitude}` : ''} - Suraksha Safety App`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact.phone
    });
    console.log(`✅ Emergency SMS sent to ${contact.phone}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${contact.phone}:`, error);
    return false;
  }
};

const isTwilioAvailable = () => !!twilioClient;

module.exports = {
  initializeTwilio,
  sendEmergencySMS,
  isTwilioAvailable
};