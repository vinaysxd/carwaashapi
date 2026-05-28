const supabase = require('../supabase');

async function createProfile(user_id, name, email) {
  const { data: existing, error: checkErr } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('user_id', user_id)
    .limit(1);
  if (checkErr) throw new Error(checkErr.message);
  if (existing && existing.length > 0) {
    throw Object.assign(new Error('Profile already exists'), { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from('customer_profiles')
    .insert({ user_id, name, email })
    .select('id, user_id, name, email, created_at')
    .single();
  if (error) throw new Error(error.message);

  return { success: true, profile };
}

async function getProfile(user_id) {
  const { data: profile, error } = await supabase
    .from('customer_profiles')
    .select('id, user_id, name, email, profile_photo_url, created_at')
    .eq('user_id', user_id)
    .single();
  if (error) throw new Error(error.message);
  if (!profile) {
    throw Object.assign(new Error('Profile not found'), { status: 404 });
  }

  return { success: true, profile };
}

async function updateProfile(user_id, name, email) {
  const { data: profile, error } = await supabase
    .from('customer_profiles')
    .update({ name, email, updated_at: new Date().toISOString() })
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  return { success: true, profile };
}

module.exports = { createProfile, getProfile, updateProfile };
