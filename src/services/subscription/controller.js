const subscriptionService = require('./service');

async function getPlans(req, res) {
  try {
    const result = await subscriptionService.getPlans();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function createSubscription(req, res) {
  console.log('[controller] createSubscription called with body:', req.body, 'user:', req.user);
  try {
    const { plan_id, vehicle_id, building_id, selected_days, coupon_code } = req.body;
    if (!plan_id || !vehicle_id || !building_id) {
      return res.status(400).json({ success: false, message: 'plan_id, vehicle_id, and building_id are required' });
    }
    const result = await subscriptionService.createSubscription(req.user.id, { plan_id, vehicle_id, building_id, selected_days, coupon_code });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getMySubscriptions(req, res) {
  try {
    const result = await subscriptionService.getMySubscriptions(req.user.id, req.query.status);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function pauseSubscription(req, res) {
  try {
    const result = await subscriptionService.pauseSubscription(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function cancelSubscription(req, res) {
  try {
    const result = await subscriptionService.cancelSubscription(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { getPlans, createSubscription, getMySubscriptions, pauseSubscription, cancelSubscription };
