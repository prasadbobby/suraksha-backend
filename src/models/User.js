const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  notificationToken: { type: String },

  // Safety preferences
  safetySettings: {
    notificationsEnabled: { type: Boolean, default: true },
    locationSharingEnabled: { type: Boolean, default: true },
    sosEnabled: { type: Boolean, default: true },
    stealthMode: { type: Boolean, default: false },
    autoRecording: { type: Boolean, default: true },
    includeLocation: { type: Boolean, default: true },
    biometricLock: { type: Boolean, default: true }
  },

  // Alert preferences
  alertPreferences: {
    emergencyAlerts: { type: Boolean, default: true },
    communityAlerts: { type: Boolean, default: true },
    travelSafetyTips: { type: Boolean, default: true },
    incidentReports: { type: Boolean, default: true },
    generalSafetyTips: { type: Boolean, default: false },
    weatherAlerts: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);