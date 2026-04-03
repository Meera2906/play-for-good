import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'profiles' });
  // If rpc doesn't exist, we can try querying pg_policies
  const { data: policies, error: pgError } = await supabase.from('pg_policies').select('*').eq('tablename', 'profiles');
  
  if (pgError) {
    // Try raw query if possible, or just check what's going on
    const { data: raw, error: rawError } = await supabase.rpc('inspect_rls', { tablename: 'profiles' });
    console.log('Policies (raw):', raw || rawError);
  } else {
    console.log('Policies for profiles:', policies);
  }

  const { data: scoresPolicies, error: sError } = await supabase.from('pg_policies').select('*').eq('tablename', 'scores');
  console.log('Policies for scores:', scoresPolicies);
}

// Since standard RLS inspection via PostgREST might be restricted, 
// let's just try to check if the admin can read their own profile.
async function checkAdminReadSelf() {
  const adminId = 'f2fddaaa-5129-499e-b32f-d21bfce511e2'; // From previous checks
  const { data, error } = await supabase.from('profiles').select('*').eq('id', adminId);
  console.log('Admin profile data:', data);
  console.log('Error:', error);
}

checkAdminReadSelf();
