const presenceService = require('./service');

async function checkIn(req, res) {
  try {
    const { building_id, coordinates } = req.body;
    if (!building_id) {
      return res.status(400).json({ success: false, message: 'building_id is required' });
    }
    const result = await presenceService.checkIn(req.user.id, { building_id, coordinates });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function checkOut(req, res) {
  try {
    const { building_id } = req.body;
    if (!building_id) {
      return res.status(400).json({ success: false, message: 'building_id is required' });
    }
    const result = await presenceService.checkOut(req.user.id, { building_id });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getTodayPresence(req, res) {
  try {
    const result = await presenceService.getTodayPresence(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { checkIn, checkOut, getTodayPresence };
