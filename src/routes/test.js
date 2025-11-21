const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// Test endpoint to debug Resend API
router.post('/email', async (req, res) => {
  try {
    const { to } = req.body;

    console.log('🧪 Testing Resend API...');
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 10)}...` : 'NOT SET');
    console.log('📧 Sending to:', to);

    const emailResponse = await resend.emails.send({
      from: 'Suraksha Safety <onboarding@resend.dev>',
      to: [to],
      subject: 'Test Email from Suraksha',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('📊 Resend API Full Response:', JSON.stringify(emailResponse, null, 2));

    res.json({
      success: true,
      message: 'Test email sent',
      response: emailResponse
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
});

module.exports = router;