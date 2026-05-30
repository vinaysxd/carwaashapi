const supabase = require('../supabase');

function today() {
  return new Date().toISOString().split('T')[0];
}

async function checkIn(user_id, { building_id, coordinates }) {
  const { data: subscription, error: subErr } = await supabase
    .from('subscriptions')
    .select('id, vehicle_id, user_id')
    .eq('user_id', user_id)
    .eq('building_id', building_id)
    .eq('status', 'active')
    .single();
  if (subErr && subErr.code !== 'PGRST116') throw new Error(subErr.message);
  if (!subscription) throw Object.assign(new Error('No active subscription found for this building'), { status: 404 });

  const date = today();

  const { data: existingPresence, error: existingErr } = await supabase
    .from('presence_logs')
    .select('*')
    .eq('user_id', user_id)
    .eq('building_id', building_id)
    .eq('date', date)
    .single();
  if (existingErr && existingErr.code !== 'PGRST116') throw new Error(existingErr.message);
  if (existingPresence) {
    return { success: true, message: 'Already checked in today', presence: existingPresence };
  }

  const presencePayload = {
    user_id,
    vehicle_id: subscription.vehicle_id,
    building_id,
    subscription_id: subscription.id,
    date,
    entry_time: new Date().toISOString(),
    is_cleaned: false,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
  };
  const { data: presence, error: presenceErr } = await supabase
    .from('presence_logs')
    .insert(presencePayload)
    .select('id, date, entry_time')
    .single();
  if (presenceErr) throw new Error(presenceErr.message);

  const jobPayload = {
    job_type: 'daily_exterior',
    status: 'assigned',
    scheduled_date: date,
    vehicle_id: subscription.vehicle_id,
    building_id,
    user_id,
    staff_id: null,
  };
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .insert(jobPayload)
    .select('id, job_type, status')
    .single();
  if (jobErr) throw new Error(jobErr.message);

  return { success: true, message: 'Checked in successfully', presence, job };
}

async function checkOut(user_id, { building_id }) {
  const date = today();

  const { data: presence, error: fetchErr } = await supabase
    .from('presence_logs')
    .select('id')
    .eq('user_id', user_id)
    .eq('building_id', building_id)
    .eq('date', date)
    .single();
  if (fetchErr && fetchErr.code !== 'PGRST116') throw new Error(fetchErr.message);
  if (!presence) throw Object.assign(new Error('No check-in found for today'), { status: 404 });

  const { error: updateErr } = await supabase
    .from('presence_logs')
    .update({ exit_time: new Date().toISOString() })
    .eq('id', presence.id);
  if (updateErr) throw new Error(updateErr.message);

  return { success: true, message: 'Checked out successfully' };
}

async function getTodayPresence(user_id) {
  const { data: presence, error } = await supabase
    .from('presence_logs')
    .select('id, date, entry_time, exit_time, is_cleaned')
    .eq('user_id', user_id)
    .eq('date', today())
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  if (!presence) throw Object.assign(new Error('No presence log found for today'), { status: 404 });

  return { success: true, presence };
}

module.exports = { checkIn, checkOut, getTodayPresence };
