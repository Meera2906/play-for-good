import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing Sign up...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'test_user_play4good@example.com',
    password: 'password123',
  });
  
  if (signUpError) {
    console.error('Sign up error:', signUpError);
  } else {
    console.log('Sign up success:', signUpData.user?.id);
  }

  console.log('\nTesting Login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test_user_play4good@example.com',
    password: 'password123',
  });
  
  if (loginError) {
    console.error('Login error:', loginError);
  } else {
    console.log('Login success:', loginData.user?.id);
  }
}

testAuth();
