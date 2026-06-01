const notificationService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function getMyNotifications(req, res, next) {
  console.log('[getMyNotifications] req.user:', req.user);
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { notifications, total } = await notificationService.getMyNotifications(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(notifications, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const result = await notificationService.markRead(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyNotifications, markRead, markAllRead };
