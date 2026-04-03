import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkScores() {
  const { data, error } = await supabase.from('scores').select('*').limit(1);
  if (error) console.error(error);
  else console.log(data);
}
checkScores();
