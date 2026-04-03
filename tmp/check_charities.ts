import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkCharitySchema() {
  const { data, error } = await supabase.from('charities').select('*').limit(1);
  if (error) console.error(error);
  else console.log('Charity data sample:', data);
  
  // Try to get column names if possible via a generic query or assume based on data
}

checkCharitySchema();
