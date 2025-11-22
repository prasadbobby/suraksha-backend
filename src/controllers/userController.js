const { User } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, notificationToken, safetySettings, alertPreferences } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (notificationToken !== undefined) updateData.notificationToken = notificationToken;
    if (safetySettings !== undefined) updateData.safetySettings = safetySettings;
    if (alertPreferences !== undefined) updateData.alertPreferences = alertPreferences;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updateSafetySettings = async (req, res) => {
  try {
    const { safetySettings } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge with existing settings
    user.safetySettings = {
      ...user.safetySettings,
      ...safetySettings
    };

    await user.save();

    const updatedUser = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user: updatedUser, message: 'Safety settings updated successfully' });
  } catch (error) {
    console.error('Update safety settings error:', error);
    res.status(500).json({ error: 'Failed to update safety settings' });
  }
};

const updateAlertPreferences = async (req, res) => {
  try {
    const { alertPreferences } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge with existing preferences
    user.alertPreferences = {
      ...user.alertPreferences,
      ...alertPreferences
    };

    await user.save();

    const updatedUser = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user: updatedUser, message: 'Alert preferences updated successfully' });
  } catch (error) {
    console.error('Update alert preferences error:', error);
    res.status(500).json({ error: 'Failed to update alert preferences' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSafetySettings,
  updateAlertPreferences
};