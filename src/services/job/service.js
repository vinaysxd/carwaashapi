const supabase = require('../supabase');
const { notifyJobComplete } = require('../notification/service');

function today() {
  return new Date().toISOString().split('T')[0];
}

async function getTodayJobs(staff_id) {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, vehicles(make, model, colour, plate_number), buildings(name), bookings(parking_level, parking_zone, parking_slot)')
    .eq('staff_id', staff_id)
    .eq('scheduled_date', today())
    .order('carry_forward', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);

  const userIds = [...new Set((jobs || []).map(j => j.user_id).filter(Boolean))];
  let profileMap = {};
  let userMap = {};

  if (userIds.length > 0) {
    const [{ data: profiles }, { data: users }] = await Promise.all([
      supabase.from('customer_profiles').select('user_id, name').in('user_id', userIds),
      supabase.from('users').select('id, phone_number').in('id', userIds),
    ]);
    profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
    userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
  }

  const enrichedJobs = (jobs || []).map(job => ({
    ...job,
    customer: {
      name: profileMap[job.user_id]?.name || null,
      phone_number: userMap[job.user_id]?.phone_number || null,
    },
  }));

  return { success: true, jobs: enrichedJobs };
}

async function getMyJobs(staff_id, { limit, offset }) {
  const { data: jobs, count, error } = await supabase
    .from('jobs')
    .select('*, vehicles(make, model, colour, plate_number), buildings(name)', { count: 'exact' })
    .eq('staff_id', staff_id)
    .order('scheduled_date', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { jobs, total: count };
}

async function startJob(id, staff_id) {
  const { data: job, error: fetchErr } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', id)
    .eq('staff_id', staff_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });
  if (job.status !== 'assigned') {
    throw Object.assign(new Error('Job must be in assigned status to start'), { status: 400 });
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Job started' };
}

async function completeJob(id, staff_id) {
  const { data: job, error: fetchErr } = await supabase
    .from('jobs')
    .select('id, status, subscription_id, booking_id, scheduled_date')
    .eq('id', id)
    .eq('staff_id', staff_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });
  if (job.status !== 'in_progress') {
    throw Object.assign(new Error('Job must be in_progress to complete'), { status: 400 });
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);

  if (job.subscription_id) {
    await supabase
      .from('presence_logs')
      .update({ is_cleaned: true })
      .eq('subscription_id', job.subscription_id)
      .eq('date', job.scheduled_date);
  }

  if (job.booking_id) {
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', job.booking_id);
  }

  notifyJobComplete(id).catch(err => console.error('notifyJobComplete failed:', err));

  return { success: true, message: 'Job completed' };
}

async function skipJob(id, staff_id, reason) {
  const { data: job, error: fetchErr } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', id)
    .eq('staff_id', staff_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'skipped', notes: reason || null })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Job skipped' };
}

async function uploadPhotos(id, staff_id, { before_photo, after_photo }) {
  const { data: job, error: fetchErr } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', id)
    .eq('staff_id', staff_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  const urls = {};

  if (before_photo) {
    const buffer = Buffer.from(before_photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const path = `${id}/before_${Date.now()}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('job-photos')
      .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data: { publicUrl } } = supabase.storage.from('job-photos').getPublicUrl(path);
    urls.before_photo_url = publicUrl;
  }

  if (after_photo) {
    const buffer = Buffer.from(after_photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const path = `${id}/after_${Date.now()}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('job-photos')
      .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data: { publicUrl } } = supabase.storage.from('job-photos').getPublicUrl(path);
    urls.after_photo_url = publicUrl;
  }

  const updatePayload = {};
  if (urls.before_photo_url) updatePayload.before_photo_url = urls.before_photo_url;
  if (urls.after_photo_url) updatePayload.after_photo_url = urls.after_photo_url;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateErr } = await supabase.from('jobs').update(updatePayload).eq('id', id);
    if (updateErr) throw new Error(updateErr.message);
  }

  return { success: true, urls };
}

module.exports = { getTodayJobs, getMyJobs, startJob, completeJob, skipJob, uploadPhotos };
