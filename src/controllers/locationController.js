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

const shareLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, contactIds, duration = 24 } = req.body;

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

    // Get contacts to notify
    const contacts = await Contact.find({
      _id: { $in: contactIds },
      userId: req.user.userId
    });

    const user = await User.findById(req.user.userId);

    // Send notifications to shared contacts
    const notifications = contacts.map(contact => {
      if (contact.email && contact.notificationsEnabled) {
        return sendEmergencyEmail(contact, user, { latitude, longitude, address });
      }
      return Promise.resolve(false);
    });

    await Promise.allSettled(notifications);

    res.json({ success: true, location, notificationsSent: contacts.length });
  } catch (error) {
    console.error('Share location error:', error);
    res.status(500).json({ error: 'Failed to share location' });
  }
};

module.exports = {
  updateLocation,
  shareLocation
};