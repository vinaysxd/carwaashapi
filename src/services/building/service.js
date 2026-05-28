const supabase = require('../supabase');

async function createBuilding(admin_id, { name, address, city, total_levels }) {
  const { data: building, error } = await supabase
    .from('buildings')
    .insert({ name, address, city, total_levels, admin_id, is_active: true })
    .select('id, name, address, city, total_levels, is_active, created_at')
    .single();
  if (error) throw new Error(error.message);
  return { success: true, building };
}

async function getBuildings() {
  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return { success: true, buildings };
}

async function getBuildingById(id) {
  const { data: building, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  if (!building) throw Object.assign(new Error('Building not found'), { status: 404 });
  return { success: true, building };
}

async function updateBuilding(id, fields) {
  const { data: building, error } = await supabase
    .from('buildings')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!building) throw Object.assign(new Error('Building not found'), { status: 404 });
  return { success: true, building };
}

module.exports = { createBuilding, getBuildings, getBuildingById, updateBuilding };
