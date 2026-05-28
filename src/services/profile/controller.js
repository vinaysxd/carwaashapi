const profileService = require('./service');

async function createProfile(req, res) {
  try {
    const { name, email } = req.body;
    const result = await profileService.createProfile(req.user.id, name, email);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const result = await profileService.getProfile(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const result = await profileService.updateProfile(req.user.id, name, email);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { createProfile, getProfile, updateProfile };
