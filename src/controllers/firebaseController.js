const { sendEmergencyNotification, sendLocationSharingNotification, isFirebaseAvailable } = require('../services/firebaseService');
const User = require('../models/User'); // Add User model import

// Send emergency notification to trusted contacts
const sendEmergencyAlert = async (req, res) => {
  try {
    const { userName, userPhone, location, contactEmails } = req.body;
    const userId = req.user.userId;

    console.log(`📨 Processing emergency notification for user ${userId}`);
    console.log(`📧 Target contacts: ${contactEmails?.length || 0}`);

    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.log('⚠️ Firebase not available, skipping push notifications');
      return res.json({
        success: false,
        error: 'Firebase not initialized',
        message: 'Push notifications are not available. Firebase Admin SDK is not configured.',
        notificationsSent: 0,
        notificationsFailed: contactEmails?.length || 0,
        firebaseAvailable: false
      });
    }

    if (!contactEmails || contactEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No contact emails provided'
      });
    }

    const notificationResult = await sendEmergencyNotification({
      userId,
      userName: userName || 'Unknown User',
      userPhone,
      location,
      contactEmails
    });

    if (notificationResult.success) {
      res.json({
        success: true,
        message: 'Emergency notifications sent successfully',
        notificationsSent: notificationResult.notificationsSent,
        notificationsFailed: notificationResult.notificationsFailed,
        details: notificationResult.details,
        firebaseAvailable: true
      });
    } else {
      res.status(500).json({
        success: false,
        error: notificationResult.error || 'Failed to send emergency notifications',
        firebaseAvailable: true
      });
    }

  } catch (error) {
    console.error('❌ Emergency notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending emergency notifications'
    });
  }
};

// Send location sharing notification
const sendLocationUpdate = async (req, res) => {
  try {
    const { userName, location, contactEmails, isLiveSharing } = req.body;
    const userId = req.user.userId;

    console.log(`📍 Processing location sharing notification for user ${userId}`);

    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.log('⚠️ Firebase not available, skipping location notifications');
      return res.json({
        success: false,
        error: 'Firebase not initialized',
        message: 'Push notifications are not available. Firebase Admin SDK is not configured.',
        notificationsSent: 0,
        notificationsFailed: contactEmails?.length || 0,
        firebaseAvailable: false
      });
    }

    if (!contactEmails || contactEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No contact emails provided'
      });
    }

    const notificationResult = await sendLocationSharingNotification({
      userId,
      userName: userName || 'Unknown User',
      location,
      contactEmails,
      isLiveSharing: isLiveSharing || false
    });

    if (notificationResult.success) {
      res.json({
        success: true,
        message: 'Location sharing notifications sent successfully',
        notificationsSent: notificationResult.notificationsSent,
        notificationsFailed: notificationResult.notificationsFailed,
        firebaseAvailable: true
      });
    } else {
      res.status(500).json({
        success: false,
        error: notificationResult.error || 'Failed to send location sharing notifications',
        firebaseAvailable: true
      });
    }

  } catch (error) {
    console.error('❌ Location sharing notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending location sharing notifications'
    });
  }
};

// Save user's Firebase notification token
const saveNotificationToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Notification token is required'
      });
    }

    console.log(`📱 Saving notification token for user ${userId}: ${token.substring(0, 20)}...`);

    // 🔧 FIX: Actually save the token to MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        notificationToken: token,
        lastSeen: new Date()
      },
      {
        new: true,
        select: '-password' // Don't return password in response
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database'
      });
    }

    console.log(`✅ Notification token saved successfully for user: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Notification token saved successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        tokenSaved: !!updatedUser.notificationToken,
        lastSeen: updatedUser.lastSeen
      }
    });

  } catch (error) {
    console.error('❌ Save notification token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while saving notification token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendEmergencyAlert,
  sendLocationUpdate,
  saveNotificationToken
};