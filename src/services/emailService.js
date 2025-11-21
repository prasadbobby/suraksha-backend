const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmergencyEmail = async (contact, userInfo, location) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@suraksha.app',
    to: contact.email,
    subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 EMERGENCY ALERT</h2>
        <p><strong>${userInfo.name}</strong> has activated an emergency alert and needs immediate assistance.</p>

        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Contact Information:</h3>
          <p><strong>Name:</strong> ${userInfo.name}</p>
          <p><strong>Phone:</strong> ${userInfo.phone || 'Not provided'}</p>
          <p><strong>Email:</strong> ${userInfo.email}</p>
        </div>

        ${location ? `
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">📍 Location:</h3>
          <p><strong>Address:</strong> ${location.address || 'Address not available'}</p>
          <p><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>
          <p><a href="https://maps.google.com/maps?q=${location.latitude},${location.longitude}"
                style="color: #1e40af; text-decoration: none;">🗺️ View on Google Maps</a></p>
        </div>
        ` : ''}

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">🚨 What to do:</h3>
          <ul>
            <li>Try calling ${userInfo.name} immediately</li>
            <li>If no response, contact local emergency services</li>
            <li>Share this location with authorities if needed</li>
          </ul>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          This message was sent automatically by Suraksha Safety App.
          Time: ${new Date().toLocaleString()}
        </p>
      </div>
    `
  };

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SURAKSHA Safety <suraksha@resend.dev>',
      to: [contact.email],
      subject: mailOptions.subject,
      html: mailOptions.html
    });
    console.log(`✅ Emergency email sent to ${contact.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${contact.email}:`, error);
    return false;
  }
};

module.exports = { sendEmergencyEmail };