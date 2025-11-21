const { Location, Contact, User } = require('../models');
const { sendEmergencyEmail } = require('../services/emailService');

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, accuracy } = req.body;

    const location = new Location({
      userId: req.user.userId,
      latitude,
      longitude,
      address,
      accuracy,
      timestamp: new Date()
    });

    await location.save();
    res.json({ success: true, location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// Email rate limiting - track per user per contact to prevent duplicates
const emailRateLimiter = new Map();
const liveLocationLimiter = new Map(); // Separate tracking for live location sharing

const shareLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, contactIds, duration = 24, isLiveSharing = false } = req.body;

    const now = Date.now();

    // For live sharing, use more aggressive deduplication
    if (isLiveSharing) {
      const liveKey = `${req.user.userId}_live_sharing`;
      const lastLiveUpdate = liveLocationLimiter.get(liveKey);

      // For live sharing, only allow updates every 3 minutes (180 seconds) minimum
      if (lastLiveUpdate && (now - lastLiveUpdate) < 180000) {
        console.log(`⚠️ Live sharing update too frequent for user ${req.user.userId}, ignoring...`);
        return res.json({
          success: true,
          message: 'Live location update already sent recently',
          isDuplicate: true
        });
      }

      // Record this live update
      liveLocationLimiter.set(liveKey, now);
    }

    // For regular sharing, check individual contact deduplication (30 seconds)
    const duplicateContacts = [];
    const validContacts = [];

    for (const contactId of contactIds) {
      const contactKey = `${req.user.userId}_${contactId}`;
      const lastEmailTime = emailRateLimiter.get(contactKey);

      if (lastEmailTime && (now - lastEmailTime) < 30000) {
        duplicateContacts.push(contactId);
      } else {
        validContacts.push(contactId);
        emailRateLimiter.set(contactKey, now);
      }
    }

    if (validContacts.length === 0) {
      console.log(`⚠️ All contacts already notified recently for user ${req.user.userId}, ignoring...`);
      return res.json({
        success: true,
        message: 'All contacts already notified recently',
        isDuplicate: true
      });
    }

    // Clean up old entries (older than 10 minutes)
    for (const [key, timestamp] of emailRateLimiter.entries()) {
      if (now - timestamp > 600000) {
        emailRateLimiter.delete(key);
      }
    }
    for (const [key, timestamp] of liveLocationLimiter.entries()) {
      if (now - timestamp > 600000) {
        liveLocationLimiter.delete(key);
      }
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration);

    const location = new Location({
      userId: req.user.userId,
      latitude,
      longitude,
      address,
      isShared: true,
      sharedWith: contactIds,
      expiresAt,
      timestamp: new Date()
    });

    await location.save();

    // Get contacts to notify - only valid contacts (not rate-limited)
    const contacts = await Contact.find({
      _id: { $in: validContacts },
      userId: req.user.userId
    });

    const user = await User.findById(req.user.userId);

    // Send notifications to valid contacts with proper rate limiting
    const emailResults = [];
    let emailsSent = 0;
    let emailsAttempted = 0;

    // Use a queue-based approach to respect Resend's rate limits
    for (const contact of contacts) {
      if (contact.email && contact.notificationsEnabled) {
        emailsAttempted++;
        console.log(`📧 Attempting to send email to ${contact.name} (${contact.email})`);

        try {
          // Implement proper rate limiting: 2 requests/second = 500ms minimum delay
          // Adding extra buffer for network latency and processing time
          if (emailsAttempted > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay to be extra safe
          }

          const result = await sendEmergencyEmail(contact, user, { latitude, longitude, address });
          emailResults.push({ contact: contact.email, result });

          if (result.success) {
            emailsSent++;
            console.log(`✅ Email successfully sent to ${contact.email}`);
          } else {
            console.log(`❌ Email failed to ${contact.email}:`, result.error);
          }
        } catch (error) {
          console.error(`🚨 Critical error sending to ${contact.email}:`, error);
          emailResults.push({ contact: contact.email, result: { success: false, error: error.message } });
        }
      } else {
        console.log(`⚠️ Skipping ${contact.name} - no email or notifications disabled`);
      }
    }

    // Log information about rate-limited contacts
    if (duplicateContacts.length > 0) {
      console.log(`⚠️ Skipped ${duplicateContacts.length} contacts due to rate limiting`);
    }

    console.log(`📊 Email Summary: ${emailsSent}/${emailsAttempted} emails sent successfully`);

    res.json({
      success: true,
      location,
      contactsNotified: contacts.length,
      contactsSkipped: duplicateContacts.length,
      emailsAttempted,
      emailsSent,
      emailResults,
      isLiveSharing,
      rateLimited: duplicateContacts.length > 0
    });
  } catch (error) {
    console.error('Share location error:', error);
    res.status(500).json({ error: 'Failed to share location' });
  }
};

module.exports = {
  updateLocation,
  shareLocation
};