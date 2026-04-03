import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkProfilesPolicies() {
  const { data, error } = await supabase.query(`
    select
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    from
      pg_policies
    where
      tablename = 'profiles';
  `);
  
  if (error) {
    console.error('Error fetching policies:', error);
  } else {
    console.log('Policies for profiles:', data);
  }
}

// Since standard query might not work if PostgREST doesn't expose pg_policies, 
// I'll try to use a direct SQL RPC if it exists, or just simulate it.
// Actually, let's try a different approach: just check if ANON key can read the profile.

const anonSupabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkAnonAccess() {
  const adminId = 'f2fddaaa-5129-499e-b32f-d21bfce511e2';
  const { data, error } = await anonSupabase.from('profiles').select('*').eq('id', adminId);
  console.log('Anon access result:', data);
  console.log('Anon access error:', error);
}

checkAnonAccess();
