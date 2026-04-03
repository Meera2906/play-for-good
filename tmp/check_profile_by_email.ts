import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkSpecificProfile() {
  const emailInput = process.argv[2] || 'admin@playforgood.com';
  console.log(`Checking profile for: ${emailInput}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', emailInput);

  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Profile data:', data);
  }
}

checkSpecificProfile();
