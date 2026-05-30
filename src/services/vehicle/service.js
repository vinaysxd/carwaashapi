const supabase = require('../supabase');

async function createVehicle(user_id, { make, model, colour, plate_number }) {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({ user_id, make, model, colour, plate_number, is_active: true })
    .select('id, user_id, make, model, colour, plate_number, created_at')
    .single();
  if (error) throw new Error(error.message);
  return { success: true, vehicle };
}

async function getVehicles(user_id, { limit, offset }) {
  const { data: vehicles, count, error } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .eq('is_active', true)
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { vehicles, total: count };
}

async function getVehicleById(id, user_id) {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (error) throw new Error(error.message);
  if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  return { success: true, vehicle };
}

async function updateVehicle(id, user_id, fields) {
  const { data: existing, error: fetchErr } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { success: true, vehicle };
}

async function deleteVehicle(id, user_id) {
  const { data: existing, error: fetchErr } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

  const { error } = await supabase
    .from('vehicles')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Vehicle removed successfully' };
}

module.exports = { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };
