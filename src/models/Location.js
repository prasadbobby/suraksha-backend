const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now },
  isShared: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  expiresAt: { type: Date }
});

module.exports = mongoose.model('Location', locationSchema);