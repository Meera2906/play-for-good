import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testFetch() {
  const { data, error } = await supabase
    .from('winner_proofs')
    .select(`
      *,
      draw:draws(month, prize_pool),
      user:profiles(full_name, email)
    `);
    
  console.log('Result:', data);
  console.log('Error:', error);
}
testFetch();
