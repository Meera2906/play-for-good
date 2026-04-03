import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAdminRole() {
  const email = 'admin@playforgood.com';
  const password = 'adminPassword123';
  
  console.log(`Verifying admin role for ${email}...`);
  
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (loginError) {
    console.error('Login error:', loginError.message);
    return;
  }
  
  console.log('Login success, fetching profile...');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', loginData.user.id)
    .single();
    
  if (profileError) {
    console.error('Profile fetch error:', profileError.message);
  } else {
    console.log('Profile Role:', profile.role);
    if (profile.role === 'admin') {
      console.log('Verification Success: User is an ADMIN.');
    } else {
      console.log('Verification Failed: User is NOT an admin.');
    }
  }
}

verifyAdminRole();
