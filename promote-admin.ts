import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function promoteToAdmin() {
  const email = 'test_user_play4good@example.com';
  console.log(`Promoting ${email} to admin...`);
  
  // 1. Find user id by email
  // (We'll just try to update the profile directly if we have the ID, or search by email)
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
    
  if (findError) {
    console.error('Error finding profile:', findError.message);
    return;
  }
  
  // 2. Update role to admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', profile.id);
    
  if (updateError) {
    console.error('Error promoting user:', updateError.message);
  } else {
    console.log('User promoted to admin successfully!');
  }
}

promoteToAdmin();
