import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkAllAuthAndProfiles() {
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing auth users:', authError);
    return;
  }

  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  if (profileError) {
    console.error('Error listing profiles:', profileError);
    return;
  }

  console.log('--- Auth Users vs Profiles ---');
  users.forEach(u => {
    const p = profiles.find(p => p.id === u.id);
    console.log(`Email: ${u.email} | Profile Role: ${p ? p.role : 'NO PROFILE'}`);
  });
}

checkAllAuthAndProfiles();
