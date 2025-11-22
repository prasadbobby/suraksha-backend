const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const User = require('../models/User');

// Initialize Firebase Admin SDK
let admin = null;
let db = null;
let messaging = null;

const initializeFirebase = () => {
  if (!admin) {
    try {
      // Check if required Firebase environment variables are available
      const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.log('⚠️ Firebase Admin SDK not configured (missing environment variables)');
        console.log('ℹ️ Missing variables:', missingVars.join(', '));
        console.log('ℹ️ Firebase notifications will be disabled. Emergency alerts will still work via SMS/email.');
        console.log('ℹ️ To enable Firebase notifications, add the following to your .env file:');
        console.log('   FIREBASE_PROJECT_ID=your-project-id');
        console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
        console.log('   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com');
        return;
      }

      // Use environment variables for Firebase Admin config
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
      };

      admin = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://drop-files-bobby.firebaseio.com"
      });

      db = getFirestore(admin);
      messaging = getMessaging(admin);

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization failed:', error.message);
      console.log('ℹ️ Firebase notifications will be disabled. Emergency alerts will still work via SMS/email.');
      // Continue without Firebase for development
    }
  }
};

// Send emergency notification to trusted contacts
const sendEmergencyNotification = async (emergencyData) => {
  try {
    if (!messaging || !db) {
      console.log('⚠️ Firebase not initialized, skipping notifications');
      return { success: false, error: 'Firebase not initialized' };
    }

    const { userId, userName, userPhone, location, contactEmails } = emergencyData;

    if (!contactEmails || contactEmails.length === 0) {
      console.log('⚠️ No contact emails provided for emergency notification');
      return { success: false, error: 'No contact emails provided' };
    }

    const notificationsSent = [];
    const notificationsFailed = [];

    // Get notification tokens for trusted contacts with emails
    for (const email of contactEmails) {
      try {
        // Query MongoDB users collection to find contacts with this email who have notification tokens
        const user = await User.findOne({ email: email, isActive: true });

        if (!user) {
          console.log(`👤 No user account found for ${email}`);
          notificationsFailed.push({ email, error: 'No app account found' });
          continue;
        }

        // Check if user has notification token
        const notificationToken = user.notificationToken;

        if (!notificationToken) {
          console.log(`📱 No notification token for user ${email}`);
          notificationsFailed.push({ email, error: 'No notification token' });
          continue;
        }

        // Create the notification message
        const message = {
          notification: {
            title: '🚨 EMERGENCY ALERT',
            body: `${userName} needs immediate help! Tap to view location and details.`
          },
          data: {
            type: 'emergency_alert',
            userId: userId,
            userName: userName,
            userPhone: userPhone || '',
            latitude: location?.latitude?.toString() || '',
            longitude: location?.longitude?.toString() || '',
            address: location?.address || '',
            timestamp: new Date().toISOString(),
            urgency: 'high'
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              priority: 'high',
              channelId: 'emergency_alerts'
            }
          },
          apns: {
            headers: {
              'apns-priority': '10'
            },
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          },
          token: notificationToken
        };

        // Send the notification
        const response = await messaging.send(message);
        console.log(`✅ Emergency notification sent to ${email}:`, response);

        notificationsSent.push({
          email,
          userId: user._id.toString(), // Convert ObjectId to string
          messageId: response,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`❌ Failed to send notification to ${email}:`, error);
        notificationsFailed.push({ email, error: error.message });
      }
    }

    // Store the emergency alert in Firestore
    try {
      const alertData = {
        userId,
        userName: userName || 'Unknown User',
        userPhone: userPhone || '',
        location: location || {},
        contactEmails: contactEmails || [],
        notificationsSent,
        notificationsFailed,
        timestamp: new Date(),
        status: 'active',
        type: 'emergency_sos'
      };

      const alertRef = await db.collection('emergencyAlerts').add(alertData);
      console.log(`📋 Emergency alert stored with ID: ${alertRef.id}`);
    } catch (error) {
      console.error('❌ Failed to store emergency alert:', error);
    }

    return {
      success: true,
      notificationsSent: notificationsSent.length,
      notificationsFailed: notificationsFailed.length,
      details: {
        sent: notificationsSent,
        failed: notificationsFailed
      }
    };

  } catch (error) {
    console.error('❌ Error in sendEmergencyNotification:', error);
    return { success: false, error: error.message };
  }
};

// Send location sharing notification
const sendLocationSharingNotification = async (locationData) => {
  try {
    if (!messaging || !db) {
      console.log('⚠️ Firebase not initialized, skipping location notifications');
      return { success: false, error: 'Firebase not initialized' };
    }

    const { userId, userName, location, contactEmails, isLiveSharing } = locationData;

    const notificationsSent = [];
    const notificationsFailed = [];

    for (const email of contactEmails) {
      try {
        const user = await User.findOne({ email: email, isActive: true });

        if (!user) continue;

        const notificationToken = user.notificationToken;

        if (!notificationToken) continue;

        const message = {
            notification: {
              title: `📍 ${userName} shared their location`,
              body: isLiveSharing ? 'Live location sharing is now active' : 'Tap to view shared location'
            },
            data: {
              type: 'location_sharing',
              userId: userId,
              userName: userName,
              latitude: location?.latitude?.toString() || '',
              longitude: location?.longitude?.toString() || '',
              address: location?.address || '',
              isLiveSharing: isLiveSharing ? 'true' : 'false',
              timestamp: new Date().toISOString()
            },
            token: notificationToken
          };

        const response = await messaging.send(message);
        notificationsSent.push({ email, messageId: response });
      } catch (error) {
        notificationsFailed.push({ email, error: error.message });
      }
    }

    return {
      success: true,
      notificationsSent: notificationsSent.length,
      notificationsFailed: notificationsFailed.length
    };

  } catch (error) {
    console.error('❌ Error in sendLocationSharingNotification:', error);
    return { success: false, error: error.message };
  }
};

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return admin !== null && messaging !== null && db !== null;
};

module.exports = {
  initializeFirebase,
  sendEmergencyNotification,
  sendLocationSharingNotification,
  isFirebaseAvailable
};