import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function healthCheck() {
  console.log('--- Play For Good System Health Check ---');
  
  // 1. Check Subscriptions table
  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('count', { count: 'exact', head: true });
    
  if (subError) {
    console.error('❌ Subscriptions Table Error:', subError.message);
  } else {
    console.log('✅ Subscriptions Table: Accessible');
  }

  // 2. Check Charities table
  const { data: charities, error: charError } = await supabase
    .from('charities')
    .select('count', { count: 'exact', head: true });

  if (charError) {
    console.error('❌ Charities Table Error:', charError.message);
  } else {
    console.log('✅ Charities Table: Accessible');
  }

  // 3. Check Scores table
  const { data: scores, error: scoreError } = await supabase
    .from('scores')
    .select('count', { count: 'exact', head: true });

  if (scoreError) {
    console.error('❌ Scores Table Error:', scoreError.message);
  } else {
    console.log('✅ Scores Table: Accessible');
  }

  console.log('-----------------------------------------');
}

healthCheck();
