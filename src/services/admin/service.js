const supabase = require('../supabase');
const { sendSMS, sendPushNotification } = require('../notification/service');

async function getAdminBuildingId(admin_id) {
  const { data: profile, error } = await supabase
    .from('admin_profiles')
    .select('building_id')
    .eq('user_id', admin_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile) throw Object.assign(new Error('Admin profile not found'), { status: 404 });
  return profile.building_id;
}

async function getDashboard(admin_id) {
  const building_id = await getAdminBuildingId(admin_id);
  const today = new Date().toISOString().split('T')[0];

  const [
    { count: total_jobs_today, error: e1 },
    { count: completed_jobs_today, error: e2 },
    { count: pending_jobs_today, error: e3 },
    { count: total_subscribers, error: e4 },
    { count: total_bookings_today, error: e5 },
    { data: completedBookings, error: e6 },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('scheduled_date', today),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('scheduled_date', today).eq('status', 'completed'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('scheduled_date', today).in('status', ['pending', 'assigned']),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('status', 'active'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('scheduled_date', today).neq('status', 'cancelled'),
    supabase.from('bookings').select('price').eq('building_id', building_id).eq('scheduled_date', today).eq('status', 'completed'),
  ]);

  const firstErr = e1 || e2 || e3 || e4 || e5 || e6;
  if (firstErr) throw new Error(firstErr.message);

  const revenue_today = (completedBookings || []).reduce((sum, b) => sum + (b.price || 0), 0);

  return {
    success: true,
    stats: { total_jobs_today, completed_jobs_today, pending_jobs_today, total_subscribers, total_bookings_today, revenue_today },
  };
}

async function getJobs(admin_id, { limit, offset, status, date }) {
  const building_id = await getAdminBuildingId(admin_id);

  let query = supabase
    .from('jobs')
    .select('id, status, scheduled_date, notes, created_at, user_id, staff_id, vehicles(make, model, plate_number)', { count: 'exact' })
    .eq('building_id', building_id)
    .order('scheduled_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (date) query = query.eq('scheduled_date', date);

  const { data: jobs, count, error } = await query;
  if (error) throw new Error(error.message);

  const userIds = [...new Set((jobs || []).map(j => j.user_id).filter(Boolean))];
  let profileMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('customer_profiles')
      .select('user_id, name')
      .in('user_id', userIds);
    (profiles || []).forEach(p => { profileMap[p.user_id] = p.name; });
  }

  const enrichedJobs = (jobs || []).map(j => ({ ...j, customer_name: profileMap[j.user_id] || null }));
  return { jobs: enrichedJobs, total: count };
}

async function reassignJob(admin_id, job_id, staff_id) {
  const building_id = await getAdminBuildingId(admin_id);

  const [{ data: staff, error: staffErr }, { data: job, error: jobErr }] = await Promise.all([
    supabase.from('staff_profiles').select('user_id').eq('user_id', staff_id).eq('building_id', building_id).maybeSingle(),
    supabase.from('jobs').select('id').eq('id', job_id).eq('building_id', building_id).maybeSingle(),
  ]);

  if (staffErr) throw new Error(staffErr.message);
  if (jobErr) throw new Error(jobErr.message);
  if (!staff) throw Object.assign(new Error('Staff not found in this building'), { status: 404 });
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  const { error } = await supabase
    .from('jobs')
    .update({ staff_id, status: 'assigned' })
    .eq('id', job_id);
  if (error) throw new Error(error.message);

  return { success: true, message: 'Job reassigned' };
}

async function getSubscribers(admin_id, { limit, offset }) {
  const building_id = await getAdminBuildingId(admin_id);

  const { data: subscribers, count, error } = await supabase
    .from('subscriptions')
    .select('id, status, start_date, end_date, created_at, user_id, vehicle_id, vehicles(make, model, plate_number)', { count: 'exact' })
    .eq('building_id', building_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  const userIds = [...new Set((subscribers || []).map(s => s.user_id).filter(Boolean))];
  let profileMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('customer_profiles')
      .select('user_id, name')
      .in('user_id', userIds);
    (profiles || []).forEach(p => { profileMap[p.user_id] = p.name; });
  }

  const enriched = (subscribers || []).map(s => ({ ...s, customer_name: profileMap[s.user_id] || null }));
  return { subscribers: enriched, total: count };
}

async function createCoupon(admin_id, { code, discount_type, discount_value, expiry_date, max_uses }) {
  const building_id = await getAdminBuildingId(admin_id);
  const normalizedCode = code.toUpperCase();

  const { data: existing, error: checkErr } = await supabase
    .from('coupons')
    .select('id')
    .eq('code', normalizedCode)
    .eq('building_id', building_id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (existing) throw Object.assign(new Error('Coupon code already exists'), { status: 409 });

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: normalizedCode,
      discount_type,
      discount_value,
      expiry_date,
      max_uses: max_uses || null,
      building_id,
      created_by: admin_id,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  return { success: true, coupon };
}

async function getCoupons(admin_id) {
  const building_id = await getAdminBuildingId(admin_id);

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('building_id', building_id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return { success: true, coupons };
}

async function deactivateCoupon(admin_id, coupon_id) {
  const building_id = await getAdminBuildingId(admin_id);

  const { data: coupon, error: fetchErr } = await supabase
    .from('coupons')
    .select('id')
    .eq('id', coupon_id)
    .eq('building_id', building_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!coupon) throw Object.assign(new Error('Coupon not found'), { status: 404 });

  const { error } = await supabase.from('coupons').update({ is_active: false }).eq('id', coupon_id);
  if (error) throw new Error(error.message);

  return { success: true, message: 'Coupon deactivated' };
}

async function blockDate(admin_id, { date, reason, notify_customers, cancellation_reason }) {
  const building_id = await getAdminBuildingId(admin_id);

  const { data: affectedBookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('id, user_id')
    .eq('building_id', building_id)
    .eq('scheduled_date', date)
    .in('status', ['pending', 'confirmed']);
  if (bookingsErr) throw new Error(bookingsErr.message);

  const affected_count = (affectedBookings || []).length;

  if (notify_customers && affected_count > 0) {
    const bookingIds = affectedBookings.map(b => b.id);
    const { error: cancelErr } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .in('id', bookingIds);
    if (cancelErr) throw new Error(cancelErr.message);

    for (const booking of affectedBookings) {
      notifyBlockedDateCancellation(booking.user_id, date, cancellation_reason)
        .catch(err => console.error('blockDate notification failed:', err.message));
    }
  }

  const { error: insertErr } = await supabase
    .from('blocked_dates')
    .insert({ date, building_id, reason: reason || null, cancellation_reason: cancellation_reason || null });
  if (insertErr) throw new Error(insertErr.message);

  return { success: true, message: 'Date blocked', affected_bookings: affected_count };
}

async function notifyBlockedDateCancellation(user_id, date, cancellation_reason) {
  const msg = cancellation_reason
    ? `Your SplashWash booking on ${date} has been cancelled. Reason: ${cancellation_reason}`
    : `Your SplashWash booking on ${date} has been cancelled by the service.`;

  const [{ data: profile }, { data: user }] = await Promise.all([
    supabase.from('customer_profiles').select('name').eq('user_id', user_id).maybeSingle(),
    supabase.from('users').select('phone_number').eq('id', user_id).maybeSingle(),
  ]);

  const name = profile?.name || 'Customer';

  await Promise.allSettled([
    sendPushNotification(user_id, 'Booking Cancelled', msg),
    user?.phone_number
      ? sendSMS(user.phone_number, `Hi ${name}, ${msg}`).catch(e => console.error('SMS failed:', e.message))
      : Promise.resolve(),
  ]);
}

async function getAnalytics(admin_id, { start_date, end_date }) {
  const building_id = await getAdminBuildingId(admin_id);

  const [
    { data: bookings, error: bookingsErr },
    { count: total_jobs, error: jobsErr },
    { count: completed_jobs, error: completedJobsErr },
    { count: total_subscribers, error: subscribersErr },
  ] = await Promise.all([
    supabase.from('bookings').select('price, status, service_type').eq('building_id', building_id).gte('scheduled_date', start_date).lte('scheduled_date', end_date).neq('status', 'cancelled'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('building_id', building_id).gte('scheduled_date', start_date).lte('scheduled_date', end_date),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('building_id', building_id).gte('scheduled_date', start_date).lte('scheduled_date', end_date).eq('status', 'completed'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('building_id', building_id).eq('status', 'active'),
  ]);

  const firstErr = bookingsErr || jobsErr || completedJobsErr || subscribersErr;
  if (firstErr) throw new Error(firstErr.message);

  const total_revenue = (bookings || []).filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0);

  const serviceMap = {};
  (bookings || []).forEach(b => {
    const type = b.service_type || 'unknown';
    serviceMap[type] = (serviceMap[type] || 0) + 1;
  });
  const top_services = Object.entries(serviceMap)
    .map(([service_type, count]) => ({ service_type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    success: true,
    analytics: { total_revenue, total_jobs, completed_jobs, total_subscribers, top_services },
  };
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
