import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data: proofs, error: pError } = await supabase.from('winner_proofs').select('*');
  console.log('--- WINNER PROOFS ---');
  console.log(proofs);
  if (pError) console.error(pError);

  const { data: entries, error: eError } = await supabase.from('draw_entries').select('*').limit(5);
  console.log('--- DRAW ENTRIES (sample) ---');
  console.log(entries?.filter(e => e.winner_status !== 'none'));
  if (eError) console.error(eError);
}

check();
