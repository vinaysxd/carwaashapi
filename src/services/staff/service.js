const supabase = require('../supabase');

function generateEmployeeId() {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `SW${digits}`;
}

async function createStaff(admin_id, { name, phone_number, building_id }) {
  const { data: building, error: buildingErr } = await supabase
    .from('buildings')
    .select('id, is_active')
    .eq('id', building_id)
    .single();
  if (buildingErr) throw new Error(buildingErr.message);
  if (!building) throw Object.assign(new Error('Building not found'), { status: 404 });
  if (!building.is_active) throw Object.assign(new Error('Building is not active'), { status: 400 });

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ phone_number, role: 'staff', is_active: false })
    .select('id')
    .single();
  if (userErr) throw new Error(userErr.message);

  const employee_id = generateEmployeeId();

  const { data: staff, error: staffErr } = await supabase
    .from('staff_profiles')
    .insert({ user_id: user.id, name, building_id, employee_id, is_approved: false })
    .select('id, user_id, name, employee_id, building_id, is_approved, created_at')
    .single();
  if (staffErr) throw new Error(staffErr.message);

  return { success: true, staff };
}

async function getAllStaff() {
  const { data: staffProfiles, error: staffErr } = await supabase
    .from('staff_profiles')
    .select('*');
  if (staffErr) throw new Error(staffErr.message);

  const userIds = staffProfiles.map((s) => s.user_id);
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, phone_number')
    .in('id', userIds);
  if (usersErr) throw new Error(usersErr.message);

  const phoneByUserId = Object.fromEntries(users.map((u) => [u.id, u.phone_number]));
  const staff = staffProfiles.map((s) => ({ ...s, phone_number: phoneByUserId[s.user_id] ?? null }));

  return { success: true, staff };
}

async function getStaffById(id) {
  const { data: staffProfile, error: staffErr } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (staffErr) throw new Error(staffErr.message);
  if (!staffProfile) throw Object.assign(new Error('Staff not found'), { status: 404 });

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('phone_number')
    .eq('id', staffProfile.user_id)
    .single();
  if (userErr) throw new Error(userErr.message);

  return { success: true, staff: { ...staffProfile, phone_number: user?.phone_number ?? null } };
}

async function approveStaff(id, admin_id) {
  const { data: staffProfile, error: fetchErr } = await supabase
    .from('staff_profiles')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!staffProfile) throw Object.assign(new Error('Staff not found'), { status: 404 });

  const { error: profileErr } = await supabase
    .from('staff_profiles')
    .update({ is_approved: true, approved_by: admin_id, approved_at: new Date().toISOString() })
    .eq('id', id);
  if (profileErr) throw new Error(profileErr.message);

  const { error: userErr } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', staffProfile.user_id);
  if (userErr) throw new Error(userErr.message);

  return { success: true, message: 'Staff approved successfully' };
}

async function deactivateStaff(id) {
  const { data: staffProfile, error: fetchErr } = await supabase
    .from('staff_profiles')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!staffProfile) throw Object.assign(new Error('Staff not found'), { status: 404 });

  const { error: userErr } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', staffProfile.user_id);
  if (userErr) throw new Error(userErr.message);

  return { success: true, message: 'Staff deactivated successfully' };
}

module.exports = { createStaff, getAllStaff, getStaffById, approveStaff, deactivateStaff };
