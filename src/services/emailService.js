const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Retry function with exponential backoff for rate limits
const sendEmailWithRetry = async (emailData, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await resend.emails.send(emailData);
      return response;
    } catch (error) {
      // Check if it's a rate limit error
      if (error.response?.status === 429 || error.message?.includes('rate_limit_exceeded')) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        console.log(`⏰ Rate limited, retrying attempt ${attempt}/${maxRetries} after ${waitTime}ms...`);

        if (attempt === maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts`);
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // For non-rate-limit errors, throw immediately
      throw error;
    }
  }
};

const sendEmergencyEmail = async (contact, userInfo, location) => {
  try {
    // Use Resend's more reliable onboarding domain or properly configured sender
    const senderEmail = process.env.EMAIL_FROM || 'Suraksha Safety <onboarding@resend.dev>';

    const emailData = {
      from: senderEmail,
      to: [contact.email],
      subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
          </div>

          <div style="padding: 20px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 15px;">
              <strong>${userInfo.name}</strong> has activated an emergency alert and needs immediate assistance.
            </p>

            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">👤 Contact Information:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${userInfo.name}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${userInfo.phone || 'Not provided'}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${userInfo.email}</p>
            </div>

            ${location ? `
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
              <h3 style="color: #1e40af; margin-top: 0;">📍 Current Location:</h3>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${location.address || 'Address not available'}</p>
              <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>
              <div style="margin-top: 10px;">
                <a href="https://maps.google.com/maps?q=${location.latitude},${location.longitude}"
                   style="background-color: #1e40af; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                   🗺️ View on Google Maps
                </a>
              </div>
            </div>
            ` : ''}

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ URGENT ACTION REQUIRED:</h3>
              <ol style="color: #856404; font-weight: bold;">
                <li>Call ${userInfo.name} immediately at ${userInfo.phone || 'their number'}</li>
                <li>If no response, contact local emergency services (911/112)</li>
                <li>Share this location information with authorities</li>
                <li>Try to reach them through other contacts if possible</li>
              </ol>
            </div>

            <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px;">
              <p style="margin: 0;">This emergency alert was automatically sent by Suraksha Safety App</p>
              <p style="margin: 0;">Time: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `
    };

    // Send email with retry logic for rate limits
    const emailResponse = await sendEmailWithRetry(emailData);

    // Debug the complete response structure
    console.log(`🔍 Debug - Full Resend Response:`, JSON.stringify(emailResponse, null, 2));

    // Handle different response formats
    const emailId = emailResponse?.data?.id || emailResponse?.id || 'no-id-returned';

    // Check if Resend returned an error in the response
    if (emailResponse.error) {
      console.log(`❌ Resend API Error for ${contact.email}:`, emailResponse.error.message);

      // Special handling for domain validation errors
      if (emailResponse.error.name === 'validation_error' && emailResponse.error.message.includes('verify a domain')) {
        console.log(`⚠️ Domain verification required. Email to ${contact.email} blocked by Resend.`);
        return {
          success: false,
          error: `Email delivery restricted: ${emailResponse.error.message}`,
          needsDomainVerification: true
        };
      }

      return { success: false, error: emailResponse.error.message };
    }

    console.log(`✅ Emergency email sent to ${contact.email} - Email ID: ${emailId}`);
    return { success: true, emailId, fullResponse: emailResponse };
  } catch (error) {
    console.error(`❌ Failed to send email to ${contact.email}:`, error);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Resend API Error Response:', error.response.data);
    }
    if (error.message) {
      console.error('Error Message:', error.message);
    }
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmergencyEmail };