import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfiles() {
  console.log('Logging in...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test_user_play4good@example.com',
    password: 'password123',
  });
  
  if (loginError) {
    console.error('Login error:', loginError.message);
    return;
  }
  
  console.log('Login success:', loginData.user?.id);

  console.log('\nTesting Profile Upsert...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: loginData.user.id,
      full_name: 'Test User',
      email: 'test_user_play4good@example.com',
      role: 'user',
      subscription_status: 'inactive',
      subscription_tier: 'none',
      lifetime_winnings: 0,
      total_impact: 0,
    }, { onConflict: 'id' });
    
  if (profileError) {
    console.error('Profile upsert error:', profileError);
  } else {
    console.log('Profile upsert success');
  }
}

testProfiles();
