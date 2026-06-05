const { randomUUID } = require('crypto');
const supabase = require('../supabase');

console.log('[service] supabase client:', typeof supabase, Object.keys(supabase));

async function getPlans() {
  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return { success: true, plans };
}

async function createSubscription(user_id, { plan_id, vehicle_id, building_id, selected_days, coupon_code }) {
  console.log('[service] createSubscription started');
  const { data: plan, error: planErr } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', plan_id)
    .eq('is_active', true)
    .single();
    console.log("=-working 11")
  if (planErr) throw new Error(planErr.message);
  if (!plan) throw Object.assign(new Error('Plan not found or inactive'), { status: 404 });
console.log("=-working 143")
  const { data: vehicle, error: vehicleErr } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', vehicle_id)
    .eq('user_id', user_id)
    .eq('is_active', true)
    .single();
    console.log("=-working 1111")
  if (vehicleErr) throw new Error(vehicleErr.message);
  if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
console.log("=-working 13")
  const { data: building, error: buildingErr } = await supabase
    .from('buildings')
    .select('id, is_active')
    .eq('id', building_id)
    .single();
  if (buildingErr) throw new Error(buildingErr.message);
  if (!building) throw Object.assign(new Error('Building not found'), { status: 404 });
  if (!building.is_active) throw Object.assign(new Error('Building is not active'), { status: 400 });
console.log("=-working 12")
  const { data: existing, error: existingErr } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user_id)
    .eq('vehicle_id', vehicle_id)
    .in('status', ['active', 'paused'])
    .limit(1)
    .single();
  if (existingErr && existingErr.code !== 'PGRST116') throw new Error(existingErr.message);
  if (existing) throw Object.assign(new Error('This vehicle already has an active subscription'), { status: 400 });
  let days;
  if (plan.days_per_week === 5) {
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  } else if (plan.days_per_week === 3) {
    if (!Array.isArray(selected_days) || selected_days.length !== 3) {
      throw Object.assign(new Error('selected_days must have exactly 3 days for this plan'), { status: 400 });
    }
    days = selected_days;
  } else {
    days = selected_days || [];
  }

  let price_after_discount = plan.price;
  let coupon_id = null;
  if (coupon_code) {
    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .eq('is_active', true)
      .eq('building_id', building_id)
      .single();
    if (couponErr) throw new Error(couponErr.message);
    if (!coupon) throw Object.assign(new Error('Invalid or inactive coupon for this building'), { status: 400 });

    if (coupon.discount_type === 'percentage') {
      price_after_discount = plan.price - (plan.price * coupon.discount_value) / 100;
    } else {
      price_after_discount = Math.max(0, plan.price - coupon.discount_value);
    }
    coupon_id = coupon.id;
  }

  const start_date = new Date().toISOString().split('T')[0];
  console.log("=-working 1")
  const insertPayload = { user_id, plan_id, vehicle_id, building_id, selected_days: days, start_date, status: 'pending', price_after_discount, coupon_id, activated_at: null, end_date: null };
  console.log('[createSubscription] incoming data before insert:', JSON.stringify(insertPayload));

  console.log('[createSubscription] query: INSERT INTO subscriptions SELECT id WHERE payload =', JSON.stringify(insertPayload));
  const { data: inserted, error: insertErr } = await supabase
    .from('subscriptions')
    .insert(insertPayload)
    .select('id')
    .single();
  console.log('[createSubscription] insert response | data:', JSON.stringify(inserted), '| error:', JSON.stringify(insertErr));
  if (insertErr) throw new Error(insertErr.message);

  console.log('[createSubscription] query: SELECT FROM subscriptions WHERE id =', inserted.id);
  const { data: subscription, error: subErr } = await supabase
    .from('subscriptions')
    .select('id, plan_id, vehicle_id, qr_code, selected_days, start_date, activated_at, end_date, status, price_after_discount')
    .eq('id', inserted.id)
    .single();
  console.log('[createSubscription] fetch response | data:', JSON.stringify(subscription), '| error:', JSON.stringify(subErr));
  if (subErr) {
    console.log("NEW ERROR = ",subErr.message)
    throw new Error(subErr.message);
  }

  return {
    success: true,
    subscription: {
      ...subscription,
      plan: { id: plan.id, name: plan.name, days_per_week: plan.days_per_week, price: plan.price },
    },
  };
}

async function getMySubscriptions(user_id, status) {
  let query = supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data: subscriptions, error: subErr } = await query;
  if (subErr) throw new Error(subErr.message);

  const enriched = await Promise.all(subscriptions.map(async (subscription) => {
    const { data: plan, error: planErr } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription.plan_id)
      .single();
    if (planErr) throw new Error(planErr.message);

    const { data: vehicle, error: vehicleErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', subscription.vehicle_id)
      .single();
    if (vehicleErr) throw new Error(vehicleErr.message);

    return { ...subscription, plan, vehicle };
  }));

  return { success: true, subscriptions: enriched };
}

async function pauseSubscription(id, user_id) {
  const { data: existing, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw Object.assign(new Error('Subscription not found'), { status: 404 });

  const { error } = await supabase.from('subscriptions').update({ status: 'paused' }).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Subscription paused successfully' };
}

async function cancelSubscription(id, user_id) {
  const { data: existing, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw Object.assign(new Error('Subscription not found'), { status: 404 });

  const { error } = await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Subscription cancelled successfully' };
}

module.exports = { getPlans, createSubscription, getMySubscriptions, pauseSubscription, cancelSubscription };
