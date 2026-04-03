import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkAdmin() {
  const { data } = await supabase.from('profiles').select('*').like('email', '%admin%');
  console.log('Profiles with admin in email:', data);
  
  if (data && data.length > 0) {
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', data[0].id);
    console.log('Updated role to admin?', !error);
  }
}
checkAdmin();
