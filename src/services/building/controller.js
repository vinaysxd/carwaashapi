const buildingService = require('./service');

async function createBuilding(req, res) {
  try {
    const { name, address, city, total_levels } = req.body;
    if (!name || !address || !city || total_levels == null) {
      return res.status(400).json({ success: false, message: 'name, address, city, and total_levels are required' });
    }
    const result = await buildingService.createBuilding(req.user.id, { name, address, city, total_levels });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getBuildings(req, res) {
  try {
    const result = await buildingService.getBuildings();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getBuildingById(req, res) {
  try {
    const result = await buildingService.getBuildingById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function updateBuilding(req, res) {
  try {
    const { name, address, city, total_levels, is_active } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (address !== undefined) fields.address = address;
    if (city !== undefined) fields.city = city;
    if (total_levels !== undefined) fields.total_levels = total_levels;
    if (is_active !== undefined) fields.is_active = is_active;
    const result = await buildingService.updateBuilding(req.params.id, fields);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { createBuilding, getBuildings, getBuildingById, updateBuilding };
