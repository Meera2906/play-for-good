import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAdmin() {
  const email = 'admin@playforgood.com';
  const password = 'adminPassword123';
  
  console.log(`Setting up admin user: ${email}...`);
  
  // 1. Sign up/Log in admin user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  let userId = authData.user?.id;
  
  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('User already exists, logging in...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) {
        console.error('Login error:', loginError.message);
        return;
      }
      userId = loginData.user.id;
    } else {
      console.error('Auth error:', authError.message);
      return;
    }
  }

  console.log('User authenticated, updating profile with admin role...');
  
  // 2. Upsert profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Admin User',
      email: email,
      role: 'admin',
      subscription_status: 'inactive',
      subscription_tier: 'none',
      lifetime_winnings: 1000,
      total_impact: 500,
    });
    
  if (profileError) {
    console.error('Profile creation error:', profileError.message);
  } else {
    console.log('Admin user setup successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

setupAdmin();
