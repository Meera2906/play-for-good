import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkDonationsTable() {
  const { data, error } = await supabase.from('donations').select('*').limit(1);
  if (error) {
    console.log('Error or table missing:', error.message);
  } else {
    console.log('Donations table exists. Sample data:', data);
  }
}

checkDonationsTable();
