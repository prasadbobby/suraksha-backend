const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relation: { type: String, required: true },
  isTrusted: { type: Boolean, default: false },
  isPriority: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: true },
  distance: { type: Number, default: 0 },
  lastSeen: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);