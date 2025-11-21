const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  triggerMethod: { type: String, enum: ['button', 'shake'], required: true },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: { type: String, enum: ['active', 'resolved', 'cancelled'], default: 'active' },
  contactsNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  notificationsSent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);