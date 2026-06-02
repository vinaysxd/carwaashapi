const adminService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function getDashboard(req, res, next) {
  try {
    const result = await adminService.getDashboard(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getJobs(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, date } = req.query;
    const { jobs, total } = await adminService.getJobs(req.user.id, { limit, offset, status, date });
    res.json({ success: true, ...paginatedResponse(jobs, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function reassignJob(req, res, next) {
  try {
    const { staff_id } = req.body;
    if (!staff_id) {
      return res.status(400).json({ success: false, message: 'staff_id is required' });
    }
    const result = await adminService.reassignJob(req.user.id, req.params.id, staff_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getSubscribers(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { subscribers, total } = await adminService.getSubscribers(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(subscribers, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function createCoupon(req, res, next) {
  try {
    const { code, discount_type, discount_value, expiry_date, max_uses } = req.body;
    if (!code || !discount_type || discount_value == null || !expiry_date) {
      return res.status(400).json({ success: false, message: 'code, discount_type, discount_value, and expiry_date are required' });
    }
    const result = await adminService.createCoupon(req.user.id, { code, discount_type, discount_value, expiry_date, max_uses });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getCoupons(req, res, next) {
  try {
    const result = await adminService.getCoupons(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deactivateCoupon(req, res, next) {
  try {
    const result = await adminService.deactivateCoupon(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function blockDate(req, res, next) {
  try {
    const { date, reason, notify_customers, cancellation_reason } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'date is required' });
    }
    const result = await adminService.blockDate(req.user.id, { date, reason, notify_customers, cancellation_reason });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'start_date and end_date are required' });
    }
    const result = await adminService.getAnalytics(req.user.id, { start_date, end_date });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getJobs,
  reassignJob,
  getSubscribers,
  createCoupon,
  getCoupons,
  deactivateCoupon,
  blockDate,
  getAnalytics,
};
