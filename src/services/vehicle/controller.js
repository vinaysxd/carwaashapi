const vehicleService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function createVehicle(req, res) {
  try {
    const { make, model, colour, plate_number } = req.body;
    if (!make || !model || !colour || !plate_number) {
      return res.status(400).json({ success: false, message: 'make, model, colour, and plate_number are required' });
    }
    const result = await vehicleService.createVehicle(req.user.id, { make, model, colour, plate_number });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getVehicles(req, res) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { vehicles, total } = await vehicleService.getVehicles(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(vehicles, total, page, limit) });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getVehicleById(req, res) {
  try {
    const result = await vehicleService.getVehicleById(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function updateVehicle(req, res) {
  try {
    const { make, model, colour, plate_number } = req.body;
    const fields = {};
    if (make !== undefined) fields.make = make;
    if (model !== undefined) fields.model = model;
    if (colour !== undefined) fields.colour = colour;
    if (plate_number !== undefined) fields.plate_number = plate_number;
    const result = await vehicleService.updateVehicle(req.params.id, req.user.id, fields);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function deleteVehicle(req, res) {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };
