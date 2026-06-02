const supabase = require('../supabase');
const sendOTP = require('../fast2sms');
const firebaseAdmin = require('../firebase');
const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

async function sendSMS(phone_number, message) {
  const response = await axios({
    method: 'GET',
    url: 'https://www.fast2sms.com/dev/bulkV2',
    params: {
      authorization: FAST2SMS_API_KEY,
      route: 'q',
      message,
      language: 'english',
      flash: 0,
      numbers: phone_number,
    },
  });
  return response.data;
}

async function sendPushNotification(user_id, title, body) {
  const { data: user, error } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', user_id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (!user || !user.fcm_token) return null;

  let firebaseResult = null;
  try {
    firebaseResult = await firebaseAdmin.messaging().send({ notification: { title, body }, token: user.fcm_token });
  } catch (err) {
    console.error('Firebase push failed:', err.message);
  }

  const { error: insertErr } = await supabase.from('notifications').insert({
    user_id,
    title,
    message: body,
    type: 'push',
  });
  if (insertErr) throw new Error(insertErr.message);

  return firebaseResult;
}

async function notifyJobAssigned(job_id) {
  const { data: job, error } = await supabase
    .from('jobs')
    .select('user_id, vehicles(make, model), buildings(name)')
    .eq('id', job_id)
    .maybeSingle();
  if (error || !job) return;

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('name')
    .eq('user_id', job.user_id)
    .maybeSingle();

  const name = profile?.name || 'Customer';
  const make = job.vehicles?.make || '';
  const model = job.vehicles?.model || '';
  const building = job.buildings?.name || '';

  await sendPushNotification(
    job.user_id,
    'Job Assigned',
    `Hi ${name}, your ${make} ${model} is being cleaned today at ${building}`
  );
}

async function notifyJobComplete(job_id) {
  console.log(`[notifyJobComplete] called for job_id=${job_id}`);
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('user_id, vehicles(make, model)')
      .eq('id', job_id)
      .maybeSingle();
    if (error || !job) return;

    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('name')
      .eq('user_id', job.user_id)
      .maybeSingle();

    const name = profile?.name || 'Customer';
    const make = job.vehicles?.make || '';
    const model = job.vehicles?.model || '';
    const title = 'Car Ready!';
    const message = `Hi ${name}, your ${make} ${model} is clean and ready. Drive clean!`;

    console.log(`[notifyJobComplete] inserting notification for user_id=${job.user_id}`);
    const { error: insertErr } = await supabase.from('notifications').insert({
      user_id: job.user_id,
      title,
      message,
      type: 'push',
    });
    if (insertErr) throw new Error(insertErr.message);
    console.log(`[notifyJobComplete] notification inserted for user_id=${job.user_id}`);

    const { data: user } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', job.user_id)
      .maybeSingle();

    if (user?.fcm_token) {
      try {
        await firebaseAdmin.messaging().send({ notification: { title, body: message }, token: user.fcm_token });
      } catch (err) {
        console.error('Firebase push failed for notifyJobComplete:', err);
      }
    }
  } catch (err) {
    console.error('[notifyJobComplete] error:', err.stack || err);
  }
}

async function notifyBookingConfirmed(booking_id) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('user_id, scheduled_date, scheduled_time, services(name), buildings(name)')
    .eq('id', booking_id)
    .maybeSingle();
  if (error || !booking) return;

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('name')
    .eq('user_id', booking.user_id)
    .maybeSingle();

  const { data: user } = await supabase
    .from('users')
    .select('phone_number')
    .eq('id', booking.user_id)
    .maybeSingle();

  const name = profile?.name || 'Customer';
  const serviceName = booking.services?.name || 'service';
  const buildingName = booking.buildings?.name || '';
  const date = booking.scheduled_date;
  const time = booking.scheduled_time;

  await Promise.allSettled([
    sendPushNotification(
      booking.user_id,
      'Booking Confirmed',
      `Your ${serviceName} on ${date} at ${time} is confirmed`
    ),
    user?.phone_number
      ? sendSMS(
          user.phone_number,
          `Hi ${name}, your SplashWash booking for ${serviceName} on ${date} at ${time} is confirmed at ${buildingName}. Please drop your keys at our office on the day.`
        ).catch(err => console.error('SMS failed:', err.message))
      : Promise.resolve(),
  ]);
}

async function notifyBookingCancelled(booking_id) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('user_id, scheduled_date, services(name)')
    .eq('id', booking_id)
    .maybeSingle();
  if (error || !booking) return;

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('name')
    .eq('user_id', booking.user_id)
    .maybeSingle();

  const { data: user } = await supabase
    .from('users')
    .select('phone_number')
    .eq('id', booking.user_id)
    .maybeSingle();

  const name = profile?.name || 'Customer';
  const serviceName = booking.services?.name || 'service';
  const date = booking.scheduled_date;

  await Promise.allSettled([
    sendPushNotification(
      booking.user_id,
      'Booking Cancelled',
      `Your booking for ${serviceName} on ${date} has been cancelled`
    ),
    user?.phone_number
      ? sendSMS(
          user.phone_number,
          `Hi ${name}, your SplashWash booking for ${serviceName} on ${date} has been cancelled.`
        ).catch(err => console.error('SMS failed:', err.message))
      : Promise.resolve(),
  ]);
}

async function getMyNotifications(user_id, { limit, offset }) {
  const { data: notifications, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { notifications, total: count };
}

async function markRead(id, user_id) {
  const { data: notification, error: fetchErr } = await supabase
    .from('notifications')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!notification) throw Object.assign(new Error('Notification not found'), { status: 404 });

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Notification marked as read' };
}

async function markAllRead(user_id) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user_id)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
  return { success: true, message: 'All notifications marked as read' };
}

module.exports = {
  sendSMS,
  sendPushNotification,
  notifyJobAssigned,
  notifyJobComplete,
  notifyBookingConfirmed,
  notifyBookingCancelled,
  getMyNotifications,
  markRead,
  markAllRead,
};
