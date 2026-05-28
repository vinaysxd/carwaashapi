const staffService = require('./service');

async function createStaff(req, res) {
  try {
    const { name, phone_number, building_id } = req.body;
    if (!name || !phone_number || !building_id) {
      return res.status(400).json({ success: false, message: 'name, phone_number, and building_id are required' });
    }
    const result = await staffService.createStaff(req.user.id, { name, phone_number, building_id });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getAllStaff(req, res) {
  try {
    const result = await staffService.getAllStaff();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getStaffById(req, res) {
  try {
    const result = await staffService.getStaffById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function approveStaff(req, res) {
  try {
    const result = await staffService.approveStaff(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function deactivateStaff(req, res) {
  try {
    const result = await staffService.deactivateStaff(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { createStaff, getAllStaff, getStaffById, approveStaff, deactivateStaff };
