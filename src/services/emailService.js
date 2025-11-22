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
    const senderEmail = process.env.EMAIL_FROM;

    const emailData = {
      from: senderEmail,
      to: [contact.email],
      subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🚨 Emergency Alert - SURAKSHA</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">

          <!-- Main Container -->
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">

            <!-- Emergency Header -->
            <div style="background-color: #dc2626; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: white;">
                🚨 EMERGENCY ALERT
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px;">
                <strong>${userInfo.name}</strong> has activated an emergency alert and needs immediate assistance.
              </p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">

              <!-- Emergency Status -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #dc2626; font-size: 18px;">🆘 Emergency Status: ACTIVE</h3>
                <p style="margin: 0; color: #991b1b;">This person requires immediate assistance. Please take action now.</p>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">👤 Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${userInfo.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone:</td>
                    <td style="padding: 8px 0; color: ${userInfo.phone ? '#059669' : '#dc2626'}; font-weight: ${userInfo.phone ? '600' : '400'};">${userInfo.phone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;">${userInfo.email}</td>
                  </tr>
                </table>
              </div>

              ${location ? `
              <!-- Location Information -->
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px;">📍 Current Location</h3>
                <p style="margin: 0 0 12px 0; color: #1f2937;">
                  <strong>Address:</strong> ${location.address || 'Resolving address...'}
                </p>
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
                  <strong>Coordinates:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
                </p>

                <!-- Map Links -->
                <div style="text-align: center;">
                  <a href="https://maps.google.com/maps?q=${location.latitude},${location.longitude}"
                     style="display: inline-block; background-color: #1f2937; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
                    🗺️ View on Google Maps
                  </a>
                  <a href="https://maps.apple.com/?q=${location.latitude},${location.longitude}"
                     style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    🍎 Apple Maps
                  </a>
                </div>
              </div>
              ` : ''}

              <!-- Emergency Actions -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #d97706; font-size: 18px;">⚠️ URGENT ACTION REQUIRED</h3>
                <ol style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
                  <li style="margin-bottom: 8px; font-weight: 600;">Call ${userInfo.name} immediately${userInfo.phone ? ` at ${userInfo.phone}` : ''}</li>
                  <li style="margin-bottom: 8px; font-weight: 600;">If no response, contact emergency services (911/100/112)</li>
                  <li style="margin-bottom: 8px; font-weight: 600;">Share location information with authorities</li>
                  <li style="font-weight: 600;">Try reaching through other mutual contacts</li>
                </ol>
              </div>

              <!-- Emergency Contacts -->
              <div style="background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px;">🚨 Emergency Numbers</h4>
                <div style="text-align: center;">
                  <a href="tel:100" style="display: inline-block; background-color: #dc2626; color: white; padding: 8px 16px; margin: 4px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 600;">📞 Police (100)</a>
                  <a href="tel:102" style="display: inline-block; background-color: #059669; color: white; padding: 8px 16px; margin: 4px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 600;">🚑 Ambulance (102)</a>
                  <a href="tel:1091" style="display: inline-block; background-color: #7c3aed; color: white; padding: 8px 16px; margin: 4px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 600;">👩 Women Helpline (1091)</a>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 20px; text-align: center; color: white;">
              <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">SURAKSHA Safety</h4>
              <p style="margin: 0 0 12px 0; color: #d1d5db; font-size: 14px;">Emergency alert system protecting communities</p>
              <div style="background-color: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 6px;">
                <p style="margin: 0; color: #e5e7eb; font-size: 12px;">
                  📧 Alert sent on: <strong>${new Date().toLocaleString()}</strong>
                </p>
                <p style="margin: 4px 0 0 0; color: #e5e7eb; font-size: 12px;">
                  🔔 This is an automated emergency notification
                </p>
              </div>
            </div>

          </div>
        </body>
        </html>
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