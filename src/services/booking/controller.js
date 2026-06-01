const bookingService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function getServices(req, res, next) {
  try {
    const result = await bookingService.getServices();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getAvailability(req, res, next) {
  try {
    const { date, building_id } = req.query;
    if (!date || !building_id) {
      return res.status(400).json({ success: false, message: 'date and building_id are required' });
    }
    const result = await bookingService.getAvailability(date, building_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createBooking(req, res, next) {
  try {
    const { service_id, vehicle_id, building_id, scheduled_date, scheduled_time, notes } = req.body;
    const result = await bookingService.createBooking(req.user.id, {
      service_id, vehicle_id, building_id, scheduled_date, scheduled_time, notes,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { bookings, total } = await bookingService.getMyBookings(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(bookings, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const result = await bookingService.getBookingById(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const result = await bookingService.cancelBooking(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function confirmKeyDrop(req, res, next) {
  try {
    const result = await bookingService.confirmKeyDrop(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getServices, getAvailability, createBooking, getMyBookings, getBookingById, cancelBooking, confirmKeyDrop };
