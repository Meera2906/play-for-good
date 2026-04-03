import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkDonationsSchema() {
  // Querying information_schema doesn't work well via the client, so we'll try to insert a dummy row or just use an empty object and check the error
  // But a better way is to use a PG function if available, or just check the columns by selecting a dummy with * and see if it works
  const { data, error } = await supabase.from('donations').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    // If table exists, we can't easily see schema via JS client unless we do a trick with POST or similar
    // Actually, I'll just write a script that tries to insert a donation with 'independent' type.
    const testDonation = {
        user_id: '00000000-0000-0000-0000-000000000000',
        charity_id: '00000000-0000-0000-0000-000000000000',
        amount: 10,
        donation_type: 'independent'
    };
    const { error: insertError } = await supabase.from('donations').insert([testDonation]).select();
    if (insertError) {
        console.log('Insert error hints at schema:', insertError.message);
    } else {
        console.log('Insert successful with test columns.');
    }
  }
}

checkDonationsSchema();
