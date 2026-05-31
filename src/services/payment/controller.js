const paymentService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function createOrder(req, res, next) {
  try {
    const { amount, payment_type, subscription_id, booking_id } = req.body;
    const result = await paymentService.createOrder(req.user.id, {
      amount,
      payment_type,
      subscription_id,
      booking_id,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;
    const result = await paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}


async function getMyPayments(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { payments, total } = await paymentService.getMyPayments(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(payments, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment, getMyPayments };
