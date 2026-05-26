
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
console.log(supabaseUrl)
const supabaseServiceRoleKey = process.env.SUPA_BASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;

if (require.main === module) {
  if (supabase && supabase.auth) {
    console.log('Supabase client initialized successfully');
  } else {
    console.error('Supabase connection failed');
  }
}
