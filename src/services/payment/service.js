const crypto = require('crypto');
const razorpay = require('../razorpay');
const supabase = require('../supabase');

async function createOrder(user_id, { amount, payment_type, subscription_id, booking_id }) {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      user_id,
      subscription_id: subscription_id || null,
      booking_id: booking_id || null,
      razorpay_order_id: order.id,
      amount,
      currency: 'INR',
      payment_type,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  return {
    order: { id: order.id, amount: order.amount, currency: order.currency },
    payment_id: payment.id,
    key: process.env.RAZORPAY_KEY_ID,
  };
}

async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id }) {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    throw Object.assign(new Error('Invalid payment signature'), { status: 400 });
  }

  const { data: payment, error: fetchErr } = await supabase
    .from('payments')
    .select('id, subscription_id, booking_id')
    .eq('id', payment_id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!payment) throw Object.assign(new Error('Payment record not found'), { status: 404 });

  const { error: updateErr } = await supabase
    .from('payments')
    .update({ status: 'completed', razorpay_payment_id, razorpay_signature })
    .eq('id', payment_id);
  if (updateErr) throw new Error(updateErr.message);

  if (payment.subscription_id) {
    const activatedAt = new Date();
    const endDate = new Date(activatedAt);
    endDate.setMonth(endDate.getMonth() + 1);
    await supabase.from('subscriptions').update({
      status: 'active',
      activated_at: activatedAt.toISOString(),
      end_date: endDate.toISOString().split('T')[0],
      qr_code: crypto.randomUUID(),
    }).eq('id', payment.subscription_id);
  }
  if (payment.booking_id) {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', payment.booking_id);
  }

  return { success: true, message: 'Payment verified successfully' };
}


async function getMyPayments(user_id, { limit, offset }) {
  const { data: payments, count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { payments, total: count };
}

module.exports = { createOrder, verifyPayment, getMyPayments };
