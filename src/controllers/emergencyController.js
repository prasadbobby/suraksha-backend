const { EmergencyAlert, Contact, User } = require('../models');
const { sendEmergencyEmail } = require('../services/emailService');
const { sendEmergencySMS, isTwilioAvailable } = require('../services/smsService');

const createAlert = async (req, res) => {
  try {
    const { triggerMethod, location } = req.body;

    // Create emergency alert
    const emergencyAlert = new EmergencyAlert({
      userId: req.user.userId,
      triggerMethod,
      location,
      status: 'active'
    });

    // Get all trusted contacts
    const trustedContacts = await Contact.find({
      userId: req.user.userId,
      isTrusted: true
    });

    const user = await User.findById(req.user.userId);

    // Send notifications to all trusted contacts
    let notificationCount = 0;
    const notificationPromises = [];

    for (const contact of trustedContacts) {
      if (contact.notificationsEnabled) {
        // Send email if available
        if (contact.email) {
          notificationPromises.push(sendEmergencyEmail(contact, user, location));
        }
        // Send SMS if Twilio is configured
        if (contact.phone && isTwilioAvailable() && process.env.TWILIO_PHONE_NUMBER) {
          notificationPromises.push(sendEmergencySMS(contact, user, location));
        }
      }
    }

    // Wait for all notifications to be sent
    const results = await Promise.allSettled(notificationPromises);
    notificationCount = results.filter(result => result.status === 'fulfilled' && result.value === true).length;

    emergencyAlert.contactsNotified = trustedContacts.map(c => c._id);
    emergencyAlert.notificationsSent = notificationCount;
    await emergencyAlert.save();

    res.json({
      success: true,
      alertId: emergencyAlert._id,
      contactsNotified: trustedContacts.length,
      notificationsSent: notificationCount
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ error: 'Failed to send emergency alert' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

module.exports = {
  createAlert,
  getAlerts
};